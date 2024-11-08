import crypto from "crypto";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import errors, {
  ICustomError,
  TErrorMessages,
} from "@/server/utils/errorHandler";

import { ICheckTokenValidityRes } from "@/app/admin/user/password-recovery/interface";
import { email as emailConfig, user } from "@/exConfig";
import { IServerResponse } from "@/server/utils/serverMethods";
import { IWithSecureData, withSecureData } from "@/server/utils/userProjection";

// apply api - /user/password-recovery
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get("key") as string;
    const email = searchParams.get("email") as string;

    dbConnect();
    const clientToken = crypto.createHash("sha256").update(key).digest("hex");
    let { emailCache, emailExpire, emailKeyName } = emailConfig;

    let findUser = {} as IWithSecureData;
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
    const { fName: userName, password: userPass } = findUser || {};

    if (findUser?._id && !userName) {
      throw new Error("token is invalid" as TErrorMessages);
    }

    if (!userPass) {
      findUser =
        (await User.findOne({ email }, withSecureData)) ||
        ({} as IWithSecureData);
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
        throw new Error("token is invalid" as TErrorMessages);
      }
    }

    const { verification } = findUser;
    const { freezed, expire, token } = verification;
    const currentTimeMs = Date.now();
    if (token !== clientToken || freezed > currentTimeMs) {
      throw new Error("token is invalid" as TErrorMessages);
    }
    if (currentTimeMs > expire) {
      throw new Error("token is expired" as TErrorMessages);
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
