import {
  IDeleteSearch,
  IDeleteSearchRes,
} from "@/app/redux/UserApiRequestInterface";
import dbConnect from "@/server/config/dbConnect";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";
import config from "@/server/config/config";
import IDBUser, { ISearches } from "@/server/interfaces/user";
import errors, { ICustomError } from "@/server/utils/errorHandler";
import User from "@/server/models/user";
import client from "@/server/config/redisConnect";
import { cookies } from "next/headers";

import { ISearches as IClientSearches } from "@/app/interfaces/user";
import { user, searches as searchesConfig } from "@/exConfig";
import { authCookie } from "@/server/utils/tokens";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
export async function DELETE(req: NextRequest) {
  try {
    const { jwtSecretCode } = config;
    const { cache, expire, keyName } = user;
    const { interestedMax, searchMax } = searchesConfig;
    let { token, searches, key }: IDeleteSearch = (await req.json()) || {};
    const removedSearch = searches.find(
      (obj) => obj.key === key
    ) as IClientSearches;
    const response = (success: boolean, message: string) => {
      return new Response(
        JSON.stringify({
          message,
          success,
          status: 200,
          removedSearch,
        } as IDeleteSearchRes),
        {
          status: 200,
        }
      );
    };
    try {
      const info = verify(token, jwtSecretCode) as IAuthJwtInfo;
      dbConnect();
      const _id = info._id;
      if (!Array.isArray(searches)) {
        throw new Error("Search history is invalid");
      }
      const userSearch: Array<ISearches> = [];
      const interested = searches.filter(({ byUser, identity, key }) => {
        const obj = { byUser, identity: String(identity), key };
        if (identity !== "category") {
          if (byUser) {
            userSearch.push(obj);
          } else {
            return obj;
          }
        }
      });

      interested
        .sort((a, b) => b.priority - a.priority)
        .slice(0, interestedMax);
      let newSearches = [
        ...userSearch.slice(0, searchMax),
        ...interested.map(({ byUser, key, identity }) => {
          return { byUser, key, identity };
        }),
      ];
      newSearches = newSearches.filter((obj) => obj.key !== key);
      const update = await User.updateOne(
        { _id },
        {
          $set: {
            searches: newSearches,
          },
        }
      );

      if (update.acknowledged && update.modifiedCount === 1) {
        if (cache) {
          try {
            let result = await client.get(keyName + _id);
            if (result) {
              const data = JSON.parse(result) as IDBUser;
              data.searches = newSearches as Array<ISearches>;
              try {
                await client.setEx(keyName + _id, expire, JSON.stringify(data));
              } catch (err) {
                cookies().delete(authCookie.name);
                throw new Error("token is expired");
              }
            }
          } catch (err) {}
        }
      } else {
        return response(
          false,
          "Could not delete from database Please try again after some time or logout and login again"
        );
      }
      return new Response(
        JSON.stringify({ success: true } as IDeleteSearchRes),
        {
          status: 200,
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        return response(false, err.message);
      }
    }
    return response(true, "");
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
