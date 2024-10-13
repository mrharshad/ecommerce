import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";

import {
  ISearches as ISearchesClientSide,
  TSearchesIdentity,
} from "@/interfaces/userClientSide";
import config from "@/server/config/config";
import client from "@/server/config/redisConnect";
import User from "@/server/models/userModels";
import errors from "@/server/utils/errorHandler";

import { ICustomError } from "@/interfaces/clientAndServer";
import {
  IAuthentication,
  IAuthorizedUser,
  IJwtInfo,
  ISearches,
} from "@/interfaces/userServerSide";
import {
  INewPasswordReq,
  INewPasswordRes,
} from "@/app/user/password-recovery/interface";
import { authentication } from "@/server/utils/userProjection";
import { locationCookieName } from "@/server/utils/cookies";

// apply api - /user/password-recovery
export async function PUT(req: NextRequest) {
  try {
    const {
      password,
      email,
      key,
      searches: clientSearches = [],
    }: INewPasswordReq = await req.json();
    dbConnect();
    const token = crypto.createHash("sha256").update(key).digest("hex");
    const {
      redisUserCache,
      jwtSecretCode,
      jwtExpireTime,
      cookieName,
      cookieExpire,
      redisUserExpire,
      interestedSearch,
      searchesQty,
    } = config;
    let redisCache = redisUserCache === "enable";
    let isRedis = false;
    let findUser = {} as IAuthentication;
    const cookie = cookies();
    if (redisCache) {
      try {
        let result = await client.get(`email:${email}`);
        if (result) {
          findUser = JSON.parse(result);
          isRedis = true;
        }
      } catch (err) {
        redisCache = false;
      }
    }
    if (findUser?.email && !findUser?._id) {
      throw new Error("invalid token");
    }

    if (!findUser.email) {
      findUser = (await User.findOne({ email }, authentication).select(
        "+password"
      )) as IAuthentication;
      if (!findUser?._id) {
        if (redisCache) {
          try {
            await client.setEx(
              `email:${email}`,
              redisUserExpire,
              JSON.stringify({ email })
            );
          } catch {}
        }
        throw new Error("invalid token");
      }
    }

    const { _id, role, searches, tokens = {} } = findUser;
    const tokenExpire = tokens.tokenExpire;

    if (tokens.token !== token || !tokenExpire) {
      throw new Error("token expired");
    }

    if (new Date(tokenExpire) < new Date()) {
      throw new Error("invalid token");
    }

    const userSearch: Array<ISearches> = [];
    const clientInterested = clientSearches.filter(
      ({ byUser, identity, key }) => {
        const obj = { byUser, identity: String(identity), key };
        if (identity !== "category") {
          if (byUser) {
            userSearch.push(obj);
          } else {
            return obj;
          }
        }
      }
    );
    clientInterested.sort((a, b) => b.priority - a.priority);
    const interested: ISearches[] = clientInterested.map(
      ({ byUser, identity, key }) => {
        return { key, identity: String(identity), byUser };
      }
    );
    for (let search of searches) {
      const key = search.key;
      if (search.byUser) {
        if (!userSearch.some((obj) => obj.key === key)) {
          userSearch.push(search);
        }
      } else {
        if (!interested.some((obj) => obj.key === key)) {
          interested.push(search);
        }
      }
    }

    let newDBSearches: ISearches[] = [
      ...userSearch.slice(0, searchesQty),
      ...interested.slice(0, interestedSearch),
    ];
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedValue = (await User.findByIdAndUpdate(
      _id,
      {
        $set: { tokens: {}, searches: newDBSearches, password: hashedPassword },
      },
      { new: true, projection: authentication }
    )) as IAuthentication;

    if (updatedValue) {
      const {
        bDate,
        bMonth,
        bYear,
        cartPro,
        fName,
        lName,
        location,
        searches: updatedSearches,
        gender,
        nOfNOrder,
        issues,
      } = updatedValue;
      if (isRedis) {
        try {
          await client.del(`email:${email}`);
        } catch {}
      }
      const authorizedData: IAuthorizedUser = {
        _id,
        email,
        bDate,
        bMonth,
        bYear,
        cartPro,
        fName,
        gender,
        lName,
        location,
        nOfNOrder,
        searches: updatedSearches,
      };
      const authenticationData: IAuthentication = {
        ...authorizedData,
        password,
        tokens: {},
        role,
        issues,
      };
      if (redisCache) {
        try {
          await client.setEx(
            `user:${_id}`,
            redisUserExpire,
            JSON.stringify(authenticationData)
          );
        } catch (err) {}
      }

      const newSearchesClientSide: ISearchesClientSide[] = [...clientSearches];
      updatedSearches.forEach(({ byUser, identity, key }) => {
        if (!clientSearches.find((obj) => obj.key === key)) {
          newSearchesClientSide.push({
            key,
            identity: (Number(identity) || identity) as TSearchesIdentity,
            byUser,
            priority: 1,
            cached: [{ page: 1, sorted: "Popular" }],
          });
        }
      });
      const jwtInfo: IJwtInfo = { _id, role };
      const newJwtToken = Jwt.sign(jwtInfo, jwtSecretCode, {
        expiresIn: jwtExpireTime,
      });
      cookie.set({
        name: locationCookieName,
        value: JSON.stringify(location[0]),
      });
      cookie.set({
        name: cookieName,
        value: newJwtToken,
        expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Password update successfully`,
          token: newJwtToken,
          data: { ...authorizedData, searches: newSearchesClientSide },
        } as INewPasswordRes),
        {
          status: 200,
        }
      );
    } else {
      throw new Error(`Password not update`);
    }
  } catch (err) {
    if (err instanceof Error) {
      return new Response(
        JSON.stringify({ success: false, text: errors(err as ICustomError) }),
        {
          status: 200,
        }
      );
    }
  }
}
