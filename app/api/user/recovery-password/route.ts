import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import { IRecoveryPasswordResponse, IRequest } from "./passwordInterface";
import { ISearches as IClientSearches } from "@/interfaces/userClientSide";
import config from "@/server/config/config";
import client from "@/server/config/redisConnect";
import User from "@/server/models/userModels";
import errors from "@/server/utils/errorHandler";

import { ICustomError } from "@/interfaces/clientAndServer";
import { IAuthentication, ISearches } from "@/interfaces/userServerSide";
import { INewData } from "../login/interface";

// apply api - /user/password-recovery
export async function PUT(req: NextRequest) {
  try {
    const {
      password,
      email,
      key,
      searches: clientSearches,
    }: IRequest = await req.json();
    dbConnect();
    const token = crypto.createHash("sha256").update(key).digest("hex");
    const {
      redisUserCache,
      jwtSecretCode,
      jwtExpireTime,
      cookieName,
      cookieExpire,
    } = config;
    let redisCache = redisUserCache === "enable";
    let isRedis = false;
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
    if (findUser?.email && !findUser?._id)
      throw new Error("Invalid email and password");
    if (!findUser.email) {
      findUser = (await User.findOne(
        { email },
        { canceled: 0, delivered: 0 }
      ).select("+password")) as IAuthentication;
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

    const { _id, role, searches, tokens = {} } = findUser;
    const tokenExpire = tokens.tokenExpire;
    if (
      tokens.token !== token ||
      !tokenExpire ||
      new Date(tokenExpire) < new Date()
    )
      throw new Error("token expired");
    findUser.password = await bcrypt.hash(password, 10);
    if (Array.isArray(clientSearches)) {
      let userSearch = clientSearches.filter(
        ({ priority, byUser }) => byUser && priority
      );
      for (let search of searches) {
        if (search.byUser && !userSearch.some((obj) => obj.key === search.key))
          userSearch.push(search as any);
      }

      let autoSearch = clientSearches
        .filter(({ priority, byUser }) => !byUser && priority)
        .sort((a, b) => b.priority - a.priority);
      for (let search of searches) {
        if (!search.byUser && !autoSearch.some((obj) => obj.key === search.key))
          autoSearch.push(search as any);
      }
      findUser.searches = userSearch
        .slice(0, 10)
        .concat(autoSearch.slice(0, 5))
        .map(({ byUser, identity, key }) => {
          return {
            key,
            byUser,
            identity:
              typeof Number(identity) == "number" ? String(identity) : identity,
          };
        }) as ISearches[];
    }
    findUser.tokens = {};
    const {
      password: newPassword,
      tokens: newTokens,
      searches: newSearches,
    } = findUser;
    const update = await User.updateOne(
      { _id },
      {
        $set: {
          password: newPassword,
          tokens: newTokens,
          searches: newSearches,
        },
      }
    );
    if (update.modifiedCount == 1) {
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
      // delete findUser.password
      const jwtToken = Jwt.sign(
        {
          _id,
          role,
        },
        jwtSecretCode,
        {
          expiresIn: jwtExpireTime,
        }
      );
      cookies().set({
        name: cookieName,
        value: jwtToken,
        expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/", // all path
      });
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
      }) as IClientSearches[];

      let newData: INewData = { ...findUser, searches: searchCaches };

      if (newData._doc) newData = newData._doc;
      return new Response(
        JSON.stringify({
          success: true,
          text: `Password update successfully`,
          token: jwtToken,
          data: newData,
        } as IRecoveryPasswordResponse),
        {
          status: 200,
        }
      );
    } else throw new Error(`Password not update`);
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
