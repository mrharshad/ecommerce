import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/userModels";
import { verify } from "jsonwebtoken";
import client from "@/server/config/redisConnect";
import errors from "@/server/utils/errorHandler";

import config from "@/server/config/config";

import { IAuthorizedUser, IJwtTokenValue } from "@/interfaces/userServerSide";
import { ICustomError } from "@/interfaces/clientAndServer";
import { NextRequest } from "next/server";
const { redisUserCache } = config;
interface IContext {
  params: {
    common: string;
  };
}
interface IGetData extends IAuthorizedUser {
  password?: string;
}

export async function GET(req: NextRequest, context: IContext) {
  try {
    const { _id } = verify(
      context.params.common,
      config.jwtSecretCode
    ) as IJwtTokenValue;
    let data: null | IGetData = null;
    let redisCache = redisUserCache == "enable";
    try {
      if (redisCache)
        data = JSON.parse((await client.get(`user:${_id}`)) as any);
    } catch (err) {
      redisCache = false;
    }
    if (!data) {
      dbConnect();
      data = (await User.findById(_id, {
        canceled: 0,
        delivered: 0,
      }).select("+password")) as IGetData;
      if (!data) {
        throw new Error("user not found");
      }
      if (redisCache)
        try {
          await client.setEx(`user:${_id}`, 86400, JSON.stringify(data));
        } catch (err) {}
    }

    delete data.password;
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
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
