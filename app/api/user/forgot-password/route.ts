import nodeMailer from "nodemailer";
import { NextRequest } from "next/server";
import { IFindUser, ISendResponse } from "./passwordInterfce";
import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import crypto from "crypto";
// apply api - /user/login
import config from "@/server/config/config";
import errors from "@/server/utils/errorHandler";
import User from "@/server/models/userModels";
import { ITokens } from "@/interfaces/userServerSide";
import { ICustomError } from "@/interfaces/clientAndServer";
import { authentication } from "@/server/utils/userProjection";
export async function PUT(req: NextRequest) {
  try {
    const response = (res: ISendResponse) =>
      new Response(JSON.stringify(res), {
        status: 200,
      });
    const { redisUserCache, smtpMail, smtpPassword, smtpService } = config;
    let redisCache = redisUserCache === "enable";
    let isRedis = false;
    let findUser = {} as IFindUser;

    let { email } = await req.json();
    dbConnect();
    let [userName, domain = ""] = email.trim().split("@");
    domain = domain.toLowerCase();
    if (domain !== "gmail.com") {
      throw new Error("Use username@gmail.com to sign up");
    }
    email = userName.concat("@", domain);
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

    if (findUser.email && !findUser._id) {
      throw new Error("Invalid email and password");
    }
    if (!findUser.email) {
      findUser = (await User.findOne({ email }, authentication).select(
        "+password"
      )) as IFindUser;
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
    const { _id, fName, tokens = {} } = findUser;

    let { holdOnToken, tokensSent = 0 } = tokens;
    if (holdOnToken) {
      const pendingTime = new Date(holdOnToken);
      let milliseconds = new Date().getTime() - pendingTime.getTime();
      const minutes = Math.floor(milliseconds / (1000 * 60));
      let pendingHours = Math.floor(minutes / 60);
      let pendingMinutes = minutes % 60;
      pendingHours = pendingHours < 0 ? Math.abs(pendingHours) : 0;
      pendingMinutes = pendingMinutes < 0 ? Math.abs(pendingMinutes) : 0;

      if (pendingHours || pendingMinutes) {
        if (!isRedis && redisCache) {
          try {
            await client.setEx(
              `email:${email}`,
              86400,
              JSON.stringify(findUser)
            );
          } catch {}
        }
        return response({
          success: false,
          text: `Try After ${pendingHours && `${pendingHours} hours`} ${
            pendingMinutes > 0 ? `: ${pendingMinutes} minutes` : ""
          } `,
          resReTryForget: pendingTime,
        });
      }
    }
    const tokenUpdate = async (tokens: ITokens) => {
      const update = await User.updateOne(
        { _id },
        {
          $set: {
            tokens,
          },
        }
      );
      if (!update.modifiedCount) throw new Error("Data Base Error");
    };
    if (tokensSent === 3) {
      tokens.tokensSent = 0;
      tokens.holdOnToken = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (holdOnToken) delete tokens.holdOnToken;
      findUser.tokens = tokens;

      if (redisCache) {
        try {
          await client.setEx(`email:${email}`, 86400, JSON.stringify(findUser));
        } catch (err) {
          await tokenUpdate(tokens);
        }
      } else {
        await tokenUpdate(tokens);
      }
      return response({
        success: false,
        text: `Try After 24 hours`,
        resReTryForget: tokens.holdOnToken,
      });
    }
    const protocol = new URL(req.url).protocol;
    const hostname = new URL(req.url).hostname;
    const randomString = crypto.randomBytes(20).toString("hex");

    const resetPasswordUrl = `${protocol}//${hostname}/user/password-recovery?key=${randomString}&email=${email}`;

    const message = `Hi ${fName}  \n\n We have received a request for password recovery on ${hostname} via your email address, You can choose your new password through this URL, \n\n ${resetPasswordUrl} \n\n This URL will become invalid after some time,\n\n  If you did not request this code, it is possible that someone else is trying to password recovery for ${hostname} Do not forward or give this code to anyone.\n\n You received this message because your @gmail address was used to password recovery on ${hostname}`;
    const transporter = nodeMailer.createTransport({
      service: smtpService,
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
      tokens.tokenExpire = new Date(Date.now() + 15 * 60 * 1000);
      tokens.tokensSent = tokensSent + 1;
      tokens.token = crypto
        .createHash("sha256")
        .update(randomString)
        .digest("hex");
      findUser.tokens = tokens;
      if (redisCache) {
        try {
          await client.setEx(`email:${email}`, 86400, JSON.stringify(findUser));
        } catch (err) {
          await tokenUpdate(tokens);
        }
      } else {
        await tokenUpdate(tokens);
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
