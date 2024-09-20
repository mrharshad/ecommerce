import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import User from "@/server/models/userModels";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { IFetchUserData, INewData, IRequest, ISendResponse } from "./interface";
import config from "@/server/config/config";

import errors from "@/server/utils/errorHandler";
import { ISearches as ISearchesClientSide } from "@/interfaces/userClientSide";
import { IJwtInfo, ISearches } from "@/interfaces/userServerSide";
import { ICustomError } from "@/interfaces/clientAndServer";
// apply api - /user/login
export async function PUT(req: NextRequest) {
  try {
    const {
      email,
      password: userEnter,
      searches: clientSearches,
    }: IRequest = await req.json();
    console.log("login api run");
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
    } = config;
    let redisCache = redisUserCache === "enable";
    let isRedis = false;
    dbConnect();
    let findUser = {} as IFetchUserData;
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
      findUser = (await User.findOne(
        { email },
        { canceled: 0, delivered: 0 }
      ).select("+password")) as IFetchUserData;

      if (!findUser?._id) {
        if (redisCache) {
          try {
            await client.setEx(
              `email:${email}`,
              86400,
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
    } = findUser as IFetchUserData;

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
      if (Array.isArray(clientSearches)) {
        let userSearch = clientSearches.filter(
          ({ priority, byUser }) => byUser && priority
        );
        for (let search of searches) {
          if (
            search.byUser &&
            !userSearch.some((obj) => obj.key === search.key)
          )
            userSearch.push(search as any);
        }

        let autoSearch = clientSearches
          .filter(({ priority, byUser }) => !byUser && priority)
          .sort((a, b) => b.priority - a.priority);
        for (let search of searches) {
          if (
            !search.byUser &&
            !autoSearch.some((obj) => obj.key === search.key)
          )
            autoSearch.push(search as any);
        }
        const newSearches = userSearch
          .slice(0, 10)
          .concat(autoSearch.slice(0, 5))
          .map(({ byUser, identity, key, update }) => {
            return {
              key,
              byUser,
              identity:
                typeof Number(identity) == "number"
                  ? String(identity)
                  : identity,
              update,
            };
          });
        findUser.searches = newSearches as ISearches[];
      }
      findUser.tokens = {};

      const jwtInfo: IJwtInfo = { _id, role };
      const newJwtToken = Jwt.sign(jwtInfo, jwtSecretCode, {
        expiresIn: jwtExpireTime,
      });
      if (isRedis) {
        try {
          await client.del(`email:${email}`);
        } catch {}
      }

      if (redisCache) {
        try {
          await client.setEx(`user:${_id}`, 86400, JSON.stringify(findUser));
        } catch (err) {}
      }
      cookies().set({
        name: cookieName,
        value: newJwtToken,
        expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000), // 2023-06-28T08:19:14.768Z  iss prakar ka data leta hai
        httpOnly: true,
        path: "/", // all path
      });

      delete findUser.password;
      const searchCaches = findUser.searches.map((search) => {
        if (typeof Number(search.identity) === "number") {
          return search;
        } else {
          const findCache = clientSearches.find(
            ({ key, cached }) => key === search.key && cached
          );
          if (findCache) return findCache;
          else return { ...search, cached: [{ page: 1, sorted: "Popular" }] };
        }
      }) as ISearchesClientSide[];
      let newData: INewData = { ...findUser } as any;
      if (newData._doc) newData = newData._doc;

      return response({
        success: true,
        text: "login successful",
        token: newJwtToken,
        data: { ...newData, searches: searchCaches },
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
            $set: { tokens: findUser.tokens, searches: findUser.searches },
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
