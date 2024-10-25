import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";

import {
  ISearches as ISearchesClientSide,
  TSearchesIdentity,
} from "@/app/interfaces/user";
import config from "@/server/config/config";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import errors, { ICustomError } from "@/server/utils/errorHandler";

import {
  IAuthentication,
  IAuthorizedUser,
  ISearches,
} from "@/server/interfaces/user";
import {
  INewPasswordReq,
  INewPasswordRes,
} from "@/app/user/password-recovery/interface";
import { authentication } from "@/server/utils/userProjection";
import { locationCookie, authCookie, authJWTOpt } from "@/server/utils/tokens";
import {
  email as emailConfig,
  user,
  searches as searchesConfig,
} from "@/exConfig";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";

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
    let { cache, expire, keyName } = user;
    let { emailKeyName, emailExpire } = emailConfig;
    const { interestedMax, searchMax } = searchesConfig;
    const { jwtSecretCode } = config;
    let isRedis = false;
    let findUser = {} as IAuthentication;
    const cookie = cookies();
    if (cache) {
      try {
        let result = await client.get(emailKeyName + email);
        if (result) {
          findUser = JSON.parse(result);
          isRedis = true;
        }
      } catch (err) {
        cache = false;
      }
    }
    const userName = findUser?.fName;
    if (findUser?._id && !userName) {
      throw new Error("invalid token");
    }

    if (!userName) {
      findUser = (await User.findOne(
        { email },
        authentication
      )) as IAuthentication;
      if (!findUser?._id) {
        if (cache) {
          try {
            await client.setEx(
              emailKeyName + email,
              emailExpire,
              JSON.stringify({ _id: email })
            );
          } catch {}
        }
        throw new Error("invalid token");
      }
    }

    const { _id, role, mobileNo, searches, tokens = {} } = findUser;
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
    const interestedSearches: ISearches[] = clientInterested.map(
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
        if (!interestedSearches.some((obj) => obj.key === key)) {
          interestedSearches.push(search);
        }
      }
    }

    let newDBSearches: ISearches[] = [
      ...userSearch.slice(0, searchMax),
      ...interestedSearches.slice(0, interestedMax),
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
        bYear,
        cartPro,
        fName,
        lName,
        location,
        searches: updatedSearches,
        gender,
      } = updatedValue;
      if (isRedis) {
        try {
          await client.del(emailKeyName + email);
        } catch {}
      }
      const authorizedData: IAuthorizedUser = {
        _id,
        bYear,
        cartPro,
        fName,
        gender,
        lName,
        location,
        searches: updatedSearches,
      };

      if (cache) {
        updatedValue.tokens = {};
        try {
          await client.setEx(
            keyName + _id,
            expire,
            JSON.stringify(updatedValue)
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
      const jwtInfo: IAuthJwtInfo = { _id, role, email, mobileNo };
      const newJwtToken = Jwt.sign(jwtInfo, jwtSecretCode, authJWTOpt);
      cookie.set({
        ...locationCookie,
        value: JSON.stringify(location[0]),
      });
      cookie.set({
        ...authCookie,
        value: newJwtToken,
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
