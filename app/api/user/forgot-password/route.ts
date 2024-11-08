import nodeMailer from "nodemailer";
import { NextRequest } from "next/server";

import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import crypto from "crypto";
// apply api - /user/login
import { orderSmtp } from "@/server/config/config";
import errors, {
  ICustomError,
  TErrorMessages,
} from "@/server/utils/errorHandler";
import User from "@/server/models/user";

import { ISendResponse } from "@/app/user/login/interface";
import {
  user,
  email as emailConfig,
  password as passwordConfig,
  frontEndServer,
  orderManage,
} from "@/exConfig";

import { IVerification } from "@/server/interfaces/user";
import { IWithSecureData, withSecureData } from "@/server/utils/userProjection";

export async function PUT(req: NextRequest) {
  try {
    const response = (res: ISendResponse) =>
      new Response(JSON.stringify(res), {
        status: 200,
      });
    const { service, host, password: smtpPassword, port } = orderSmtp;
    const smtpMail = orderManage.mail;
    let { cache } = user;
    let { emailExpire, emailKeyName, wait } = emailConfig;
    const { tokenExpired, tokenLimit } = passwordConfig;
    let findUser = {} as IWithSecureData;

    let { email } = await req.json();
    dbConnect();
    let [userName, domain = ""] = email.trim().split("@");
    domain = domain.toLowerCase();
    if (domain !== "gmail.com") {
      throw new Error("Use username@gmail.com to sign up");
    }
    email = userName.concat("@", domain);
    if (cache) {
      try {
        let result = await client.get(emailKeyName + email);
        if (result) {
          findUser = JSON.parse(result);
        }
      } catch (err) {
        cache = false;
      }
    }
    const userFirstName = findUser?.fName;
    if (findUser._id && !userFirstName) {
      throw new Error("Invalid Email" as TErrorMessages);
    }
    if (!findUser.email) {
      findUser = (await User.findOne(
        { email },
        withSecureData
      )) as IWithSecureData;
      if (!findUser?._id) {
        if (cache) {
          try {
            await client.setEx(
              emailKeyName + email,
              emailExpire,
              JSON.stringify({ _id: email })
            );
          } catch {}
        }
        throw new Error("Invalid Email" as TErrorMessages);
      }
    }
    const { _id, fName, verification } = findUser;

    let { count, freezed } = verification;
    const currentTimeMs = Date.now();
    const isFreezed = freezed > currentTimeMs;
    if (isFreezed) {
      if (!userFirstName && cache) {
        try {
          await client.setEx(
            emailKeyName + email,
            emailExpire,
            JSON.stringify(findUser)
          );
        } catch {}
      }
      return response({
        success: false,
        text: "Account freezed" as TErrorMessages,
        resReTryForget: freezed,
      });
    }
    const tokenUpdate = async (verification: IVerification) => {
      const update = await User.updateOne(
        { _id },
        {
          $set: { verification },
        }
      );
      if (!update.modifiedCount) throw new Error("Data Base Error");
    };
    if (count === tokenLimit) {
      verification.count = 0;
      verification.freezed = freezed = Date.now() + wait * 60 * 60 * 1000;

      findUser.verification = verification;

      if (cache) {
        try {
          await client.setEx(
            emailKeyName + email,
            emailExpire,
            JSON.stringify(findUser)
          );
        } catch (err) {
          await tokenUpdate(verification);
        }
      } else {
        await tokenUpdate(verification);
      }
      return response({
        success: false,
        text: `Try After ${wait} hours`,
        resReTryForget: freezed,
      });
    }

    const { protocol, hostname, tLD } = frontEndServer;
    const randomString = crypto.randomBytes(20).toString("hex");
    const resetPasswordUrl = `${protocol}${hostname}${tLD}/admin/user/password-recovery?key=${randomString}&email=${email}`;

    const message = `Hi ${fName}  \n\n We have received a request for password recovery on ${hostname} via your email address, You can choose your new password through this URL, \n\n ${resetPasswordUrl} \n\n This URL will become invalid after some time,\n\n  If you did not request this code, it is possible that someone else is trying to password recovery for ${hostname} Do not forward or give this code to anyone.\n\n You received this message because your @gmail address was used to password recovery on ${hostname}`;
    const transporter = nodeMailer.createTransport({
      service,
      host,
      port,
      auth: {
        user: smtpMail,
        pass: smtpPassword,
      },
    });
    const mailOption = {
      from: smtpMail,
      to: email,
      subject: `${hostname} password recovery`,
      text: message,
    };
    const sendMail = await transporter.sendMail(mailOption);

    if (sendMail.accepted.length > 0) {
      verification.expire = Date.now() + tokenExpired * 60 * 1000;
      verification.count = count + 1;
      verification.token = crypto
        .createHash("sha256")
        .update(randomString)
        .digest("hex");

      findUser.verification = verification;
      if (cache) {
        try {
          await client.setEx(
            emailKeyName + email,
            emailExpire,
            JSON.stringify(findUser)
          );
        } catch (err) {
          await tokenUpdate(verification);
        }
      } else {
        await tokenUpdate(verification);
      }
      return response({ success: true, text: `Email send:- ${email}` });
    } else {
      return response({
        success: false,
        text: "There was a problem sending token, please try again later",
      });
    }
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
