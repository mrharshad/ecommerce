import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import User from "@/server/models/userModels";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { IRequest, ISendResponse } from "./interface";
import config from "@/server/config/config";

import errors from "@/server/utils/errorHandler";
import {
  ISearches as ISearchesClientSide,
  TSearchesIdentity,
} from "@/interfaces/userClientSide";
import {
  IAuthentication,
  IAuthorizedUser,
  IJwtInfo,
  ISearches,
} from "@/interfaces/userServerSide";
import { ICustomError } from "@/interfaces/clientAndServer";
import { authentication, authorizedUser } from "@/server/utils/userProjection";
import { locationCookieName } from "@/server/utils/cookies";
// apply api - /user/login
export async function PUT(req: NextRequest) {
  try {
    const cookie = cookies();
    const {
      email,
      password: userEnter,
      searches: clientSearches = [],
    }: IRequest = await req.json();

    const response = (res: ISendResponse) =>
      new Response(JSON.stringify(res), {
        status: 200,
      });
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
    dbConnect();
    let findUser = {} as IAuthentication;
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
    if (findUser.email && !findUser._id) {
      throw new Error("Invalid email and password");
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
        throw new Error("Invalid email and password");
      }
    }

    const {
      _id,
      role,
      password,
      searches,
      tokens = {},
    } = findUser as IAuthentication;

    let { holdOnVerification, verificationFailed = 0 } = tokens;

    if (holdOnVerification) {
      const pendingTime = new Date(holdOnVerification);
      let milliseconds = new Date().getTime() - pendingTime.getTime();
      const minutes = Math.floor(milliseconds / (1000 * 60));
      let pendingHours = Math.floor(minutes / 60);
      let pendingMinutes = minutes % 60;
      pendingHours = pendingHours < 0 ? Math.abs(pendingHours) : 0;
      pendingMinutes = pendingMinutes < 0 ? Math.abs(pendingMinutes) : 0;

      if (pendingHours || pendingMinutes) {
        if (!isRedis && redisCache) {
          try {
            await client.setEx(
              `email:${email}`,
              86400,
              JSON.stringify(findUser)
            );
          } catch {}
        }

        return response({
          success: false,
          text: `Try After ${pendingHours && `${pendingHours} hours`} ${
            pendingMinutes > 0 ? `: ${pendingMinutes} minutes` : ""
          } `,
          resHoldOnVerification: pendingTime,
        });
      }
    }

    const verification = await bcrypt.compare(userEnter, password as string);
    if (verification) {
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

      const jwtInfo: IJwtInfo = { _id, role };

      if (isRedis) {
        try {
          await client.del(`email:${email}`);
        } catch {}
      }
      const updatedValue = (await User.findByIdAndUpdate(
        _id,
        {
          $set: { tokens: {}, searches: newDBSearches },
        },
        { new: true, projection: authentication }
      )) as IAuthentication;

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

      if (!updatedValue) throw new Error("Data Base Error");

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

      return response({
        success: true,
        text: "login successful",
        token: newJwtToken,
        data: { ...authorizedData, searches: newSearchesClientSide },
      });
    } else {
      if (verificationFailed === 3) {
        tokens.verificationFailed = 0;
        tokens.holdOnVerification = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else {
        tokens.verificationFailed = verificationFailed + 1;
        if (holdOnVerification) delete tokens.holdOnVerification;
      }

      findUser.tokens = tokens;

      const tokenUpdateInDB = async () => {
        const update = await User.updateOne(
          { _id },
          {
            $set: { tokens: findUser.tokens },
          }
        );
        if (!update.modifiedCount) throw new Error("Data Base Error");
      };

      if (redisCache) {
        try {
          await client.setEx(`email:${email}`, 86400, JSON.stringify(findUser));
        } catch (err) {
          await tokenUpdateInDB();
        }
      } else {
        await tokenUpdateInDB();
      }

      if (tokens.holdOnVerification)
        return response({
          success: false,
          text: "try after 24 hours",
          resHoldOnVerification: tokens.holdOnVerification,
        });
      else
        return response({ success: false, text: "invalid email and password" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ success: false, text: errors(error as ICustomError) }),
        {
          status: 200,
        }
      );
    }
  }
}
