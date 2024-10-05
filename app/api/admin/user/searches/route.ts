import {
  ISetNewSearches,
  ISetNewSearchesRes,
} from "@/app/redux/UserApiRequestInterface";
import dbConnect from "@/server/config/dbConnect";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";
import config from "@/server/config/config";
import IDBUser, {
  IJwtTokenValue,
  ISearches,
  TSearchesIdentity,
} from "@/interfaces/userServerSide";
import errors from "@/server/utils/errorHandler";
import User from "@/server/models/userModels";
import client from "@/server/config/redisConnect";
import { cookies } from "next/headers";
import { ICustomError } from "@/interfaces/clientAndServer";
export async function PATCH(req: NextRequest) {
  try {
    const {
      jwtSecretCode,
      interestedSearch,
      searchesQty,
      redisUserCache,
      redisUserExpire,
      cookieName,
    } = config;
    let cache = redisUserCache === "enable";
    let { token, searches }: ISetNewSearches = await req.json();

    const info = verify(token, jwtSecretCode) as IJwtTokenValue;
    dbConnect();
    const _id = info._id;
    if (!Array.isArray(searches)) {
      throw new Error("Search history is invalid");
    }
    const userSearch: Array<ISearches> = [];
    const clientInterested = searches.filter(({ byUser, identity, key }) => {
      const obj = { byUser, identity: String(identity), key };
      if (identity !== "category") {
        if (byUser) {
          userSearch.push(obj);
        } else {
          return obj;
        }
      }
    });

    clientInterested
      .sort((a, b) => b.priority - a.priority)
      .slice(0, interestedSearch);

    const interested: ISearches[] = clientInterested.map(
      ({ cached, priority, ...obj }) => obj as ISearches
    );
    const newSearches = [...userSearch.slice(0, searchesQty), ...interested];

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
          let result = await client.get(`user:${_id}`);
          if (result) {
            const data = JSON.parse(result) as IDBUser;
            data.searches = newSearches as Array<ISearches>;
            try {
              await client.setEx(
                `user:${_id}`,
                redisUserExpire,
                JSON.stringify(data)
              );
            } catch (err) {
              cookies().delete(cookieName);
              throw new Error("token is expired");
            }
          }
        } catch (err) {}
      }
    }
    return new Response(
      JSON.stringify({ success: true } as ISetNewSearchesRes),
      {
        status: 200,
      }
    );
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
