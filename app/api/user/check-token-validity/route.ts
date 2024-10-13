import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";

import { ISearches as IClientSearches } from "@/interfaces/userClientSide";
import config from "@/server/config/config";
import client from "@/server/config/redisConnect";
import User from "@/server/models/userModels";
import errors from "@/server/utils/errorHandler";

import { ICustomError, IServerResponse } from "@/interfaces/clientAndServer";
import { IAuthentication, ISearches } from "@/interfaces/userServerSide";
import { authentication } from "@/server/utils/userProjection";
import { ICheckTokenValidityRes } from "@/app/user/password-recovery/interface";

// apply api - /user/password-recovery
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get("key") as string;
    const email = searchParams.get("email") as string;

    dbConnect();
    const token = crypto.createHash("sha256").update(key).digest("hex");
    const { redisUserCache, redisUserExpire } = config;

    let redisCache = redisUserCache === "enable";

    let findUser = {} as IAuthentication;
    const redisUrl = `email:${email}`;
    if (redisCache) {
      try {
        let result = await client.get(redisUrl);
        if (result) {
          findUser = JSON.parse(result);
        }
      } catch (err) {
        redisCache = false;
      }
    }
    if (findUser?.email && !findUser?._id) {
      throw new Error("invalid token");
    }

    if (!findUser.email) {
      findUser =
        (await User.findOne({ email }, authentication).select("+password")) ||
        ({} as IAuthentication);
      const _id = findUser._id;
      if (redisCache) {
        try {
          await client.setEx(
            redisUrl,
            redisUserExpire,
            JSON.stringify(_id ? findUser : { email })
          );
        } catch {}
      }
      if (!_id) {
        throw new Error("invalid token");
      }
    }

    const { tokens = {} } = findUser;
    const tokenExpire = tokens.tokenExpire;
    if (tokens.token !== token || !tokenExpire) {
      throw new Error("invalid token");
    }
    if (new Date(tokenExpire) < new Date()) {
      throw new Error("token expired");
    }
    return new Response(
      JSON.stringify({
        message: "",
        success: true,
      } as ICheckTokenValidityRes),
      {
        status: 200,
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: errors(err as ICustomError),
        } as IServerResponse),
        {
          status: 200,
        }
      );
    }
  }
}
