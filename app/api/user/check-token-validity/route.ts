import crypto from "crypto";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import errors, { ICustomError } from "@/server/utils/errorHandler";

import { IAuthentication } from "@/server/interfaces/user";
import { authentication } from "@/server/utils/userProjection";
import { ICheckTokenValidityRes } from "@/app/user/password-recovery/interface";
import { email as emailConfig, user } from "@/exConfig";
import { IServerResponse } from "@/server/utils/serverMethods";

// apply api - /user/password-recovery
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get("key") as string;
    const email = searchParams.get("email") as string;

    dbConnect();
    const token = crypto.createHash("sha256").update(key).digest("hex");
    let { emailCache, emailExpire, emailKeyName } = emailConfig;

    let findUser = {} as IAuthentication;
    const redisUrl = emailKeyName + email;
    if (emailCache) {
      try {
        let result = await client.get(redisUrl);
        if (result) {
          findUser = JSON.parse(result);
        }
      } catch (err) {
        emailCache = false;
      }
    }
    const userName = findUser.fName;
    if (findUser?._id && !userName) {
      throw new Error("invalid token");
    }

    if (!userName) {
      findUser =
        (await User.findOne({ email }, authentication).select("+password")) ||
        ({} as IAuthentication);
      const _id = findUser._id;
      if (emailCache) {
        try {
          await client.setEx(
            redisUrl,
            emailExpire,
            JSON.stringify(_id ? findUser : { _id: email })
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
