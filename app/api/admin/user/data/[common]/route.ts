import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/user";
import { verify } from "jsonwebtoken";
import client from "@/server/config/redisConnect";
import errors, { ICustomError } from "@/server/utils/errorHandler";

import config from "@/server/config/config";
import { user } from "@/exConfig";
import { IAuthentication, IAuthorizedUser } from "@/server/interfaces/user";

import { NextRequest } from "next/server";
import { authentication } from "@/server/utils/userProjection";
import { IFetch } from "@/app/layout";
import { cookies } from "next/headers";
import { authCookie } from "@/server/utils/tokens";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";

interface IContext {
  params: {
    common: string;
  };
}

export async function GET(req: NextRequest, context: IContext) {
  try {
    const { _id } = verify(
      context.params.common,
      config.jwtSecretCode
    ) as IAuthJwtInfo;
    const { cache, expire, keyName } = user;
    let data: null | IAuthentication = null;
    let redisCache: null | boolean = cache;
    try {
      if (redisCache) {
        const redisData = await client.get(keyName + _id);
        if (redisData) {
          data = JSON.parse(redisData) as any;
          redisCache = null;
        }
      }
    } catch (err) {
      redisCache = false;
    }
    if (redisCache !== null) {
      dbConnect();
      data = (await User.findById(_id, authentication)) as IAuthentication;
    }

    let { bYear, cartPro, fName, gender, lName, location, searches } = (data ||
      {}) as IAuthentication;

    if (!fName) {
      cookies().delete(authCookie.name);
      throw new Error("token is invalid");
    }
    const sendData: IAuthorizedUser = {
      _id,
      bYear,
      cartPro,
      fName,
      lName,
      location,
      searches,
      gender,
    };

    if (redisCache) {
      try {
        await client.setEx(keyName + _id, expire, JSON.stringify(data));
      } catch (err) {}
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: sendData,
        text: "",
      } as IFetch),
      {
        status: 200,
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      return new Response(
        JSON.stringify({
          success: true,
          text: errors(err as ICustomError),
        }),
        {
          status: 200,
        }
      );
    }
  }
}
