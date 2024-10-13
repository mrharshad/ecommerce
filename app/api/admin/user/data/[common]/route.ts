import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/userModels";
import { verify } from "jsonwebtoken";
import client from "@/server/config/redisConnect";
import errors from "@/server/utils/errorHandler";

import config from "@/server/config/config";

import {
  IAuthentication,
  IAuthorizedUser,
  IJwtTokenValue,
} from "@/interfaces/userServerSide";
import { ICustomError } from "@/interfaces/clientAndServer";
import { NextRequest } from "next/server";
import { authentication } from "@/server/utils/userProjection";
import { IFetch } from "@/app/layout";
import { cookies } from "next/headers";
const { redisUserCache, redisUserExpire, cookieName } = config;
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
    ) as IJwtTokenValue;
    let data: null | IAuthentication = null;
    let redisCache: null | boolean = redisUserCache == "enable";
    try {
      if (redisCache) {
        const redisData = await client.get(`user:${_id}`);
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
      data = (await User.findById(_id, authentication).select(
        "+password"
      )) as IAuthentication;
    }

    let {
      bDate,
      bMonth,
      bYear,
      cartPro,
      email,
      fName,
      gender,
      lName,
      location,
      nOfNOrder,
      searches,
    } = (data || {}) as IAuthentication;

    if (!fName) {
      cookies().delete(cookieName);
      throw new Error("token is invalid");
    }
    const sendData: IAuthorizedUser = {
      _id,
      bDate,
      bMonth,
      bYear,
      cartPro,
      email,
      fName,
      gender,
      lName,
      location,
      nOfNOrder,
      searches,
    };

    if (redisCache) {
      try {
        await client.setEx(
          `user:${_id}`,
          redisUserExpire,
          JSON.stringify(data)
        );
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
