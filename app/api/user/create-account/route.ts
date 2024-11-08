import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/user";
import nodeMailer from "nodemailer";
import Jwt from "jsonwebtoken";
import client from "@/server/config/redisConnect";
import AdditionalInfo, { docId } from "@/server/models/additionalInfo";
import SignUpFirstStep from "@/server/models/signUp";
import { hash } from "bcrypt";
import { cookies } from "next/headers";
import { IRequest, ISignUpResponse, TTokenStatus } from "./interface";

import ISignUpFirstStep from "@/server/interfaces/signUp";

import IDBUser, {
  IClientSideShared,
  ICommonData,
  IOrderDocs,
  ISearches,
} from "@/server/interfaces/user";
import { IValidToken } from "@/app/user/sign-up/interface";

import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";
import config, { orderSmtp } from "@/server/config/config";
import {
  user,
  email as emailConfig,
  searches as searchesConfig,
  orderManage,
  frontEndServer,
} from "@/exConfig";
import {
  emailVerifyJWTOpt,
  authCookie,
  locationCookie,
  authJWTOpt,
  orderDocsCookie,
} from "@/server/utils/tokens";
import { IAuthJwtInfo, IEmailVerify } from "@/server/interfaces/tokens";
import { TErrorMessages } from "@/server/utils/errorHandler";

// apply api - /user/sign-up
export async function POST(req: Request) {
  try {
    const { cache, expire, keyName } = user;
    let {
      emailCache,
      emailKeyName,
      tokenLimit: emailTokenLimit,
      wait,
      emailExpire,
    } = emailConfig;

    const { searchMax, interestedMax } = searchesConfig;
    const cookie = cookies();
    const { jwtSecretCode } = config;
    const { service, host, password: smtpPassword, port } = orderSmtp;

    const smtpMail = orderManage.mail;
    const response = (res: ISignUpResponse, status: number): Response => {
      return new Response(JSON.stringify(res), {
        status,
      });
    };
    // const hostname = new URL(req.url).hostname;
    const currentTimeMs = Date.now();
    const { hostname } = frontEndServer;
    let {
      fName,
      lName,
      email,
      address,
      mobileNo,
      birth,
      gender,
      validCode,
      password,
      pinCode,
      district,
      state,
      area,
      searches = [],
    }: IRequest = await req.json();
    let [mailId, domain] = email.toLowerCase().trim().split("@");
    if (mailId.length < 3) {
      throw new Error("Enter valid email id");
    }
    email = mailId + "@gmail.com";
    const { dateType } = birth;
    let findUser = {} as ISignUpFirstStep;
    if (emailCache) {
      try {
        let result = (await client.get(emailKeyName + email)) as any;

        if (result) {
          findUser = JSON.parse(result);
        }
      } catch {
        emailCache = false;
      }
    }
    dbConnect();
    const userToken = findUser?.token;
    if (!userToken) {
      findUser = (await SignUpFirstStep.findById(email)) as ISignUpFirstStep;
      if (!findUser?._id) {
        const registeredUser = await User.findOne({ email }, { _id: 1 });

        if (registeredUser) {
          throw new Error("Invalid Email" as TErrorMessages);
        }
      }
    }
    const holdTime = (pending: Date) => {
      const pendingTime = new Date(pending);
      let milliseconds = new Date().getTime() - pendingTime.getTime();
      const minutes = Math.floor(milliseconds / (1000 * 60));
      let pendingHours = Math.floor(minutes / 60);
      let pendingMinutes = minutes % 60;
      pendingHours = pendingHours < 0 ? Math.abs(pendingHours) : 0;
      pendingMinutes = pendingMinutes < 0 ? Math.abs(pendingMinutes) : 0;
      if (pendingHours || pendingMinutes) {
        throw new Error(
          `Try After ${pendingHours && `${pendingHours} hours`} ${
            pendingMinutes > 0 ? `: ${pendingMinutes} minutes` : ""
          } `
        );
      }
    };

    const newToken = () => {
      const characters =
        "ABCstuDE67FGHIJKOPQRSTUVWXabcdefghijklmnopqrvwxyzYZ0123458LM9N";
      let randomString = "";
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
      }
      return {
        randomString,
        token: Jwt.sign(
          { token: randomString, email } as IEmailVerify,
          jwtSecretCode,
          emailVerifyJWTOpt
        ),
      };
    };

    const sendToken = async (randomString: string): Promise<void> => {
      const transporter = nodeMailer.createTransport({
        service,
        host,
        port,
        // secure: true,
        auth: {
          user: smtpMail,
          pass: smtpPassword,
        },
      });
      const message = `Hi ${fName} \n\n We have received a request to sign up on ${hostname} via your email address. Your ${hostname} verification code is: \n\n Verification Code : ${randomString} \n\n If you did not request this code, it is possible that someone else is trying to sign up for ${hostname}. Do not forward or give this code to anyone. \n\n You received this message because your @gmail address was used to sign up on ${hostname}.`;
      const mailOption = {
        from: smtpMail,
        to: email,
        subject: `${hostname} Email Verification Code`,
        text: message,
      };
      const sendMail = await transporter.sendMail(mailOption);
      if (!sendMail.accepted.length) {
        throw new Error("Try again after some time" as TErrorMessages);
      }
    };

    const manageToken = async (
      data: ISignUpFirstStep,
      tokenStatus: TTokenStatus
    ) => {
      if (tokenStatus == "update") {
        data.numOfSendToken = data.numOfSendToken + 1;
        if (data.numOfSendToken >= emailTokenLimit) {
          data.reTry = new Date(currentTimeMs + wait * 60 * 60 * 1000);
        }
      }
      if (data.numOfSendToken >= emailTokenLimit) {
        data.numOfSendToken = 0;
      }
      const mongodbCreate = async () => {
        const crete = await SignUpFirstStep.create(data);
        if (!crete) {
          throw new Error("Contact our team or try again later");
        }
      };
      const mongodbUpdate = async () => {
        const update = await SignUpFirstStep.updateOne(
          {
            _id: email,
          },
          { $set: data }
        );
        if (update.modifiedCount === 0) {
          throw new Error("Contact our team or try again later");
        }
      };
      const redisCreateUpdate = async () => {
        try {
          await client.setEx(
            emailKeyName + email,
            emailExpire,
            JSON.stringify(data)
          );
        } catch (err) {
          const findEmail = await SignUpFirstStep.findById(email);

          if (findEmail) await mongodbUpdate();
          else await mongodbCreate();
        }
      };
      if (emailCache && (tokenStatus == "create" || tokenStatus == "update")) {
        await redisCreateUpdate();
      } else if (!emailCache && tokenStatus == "create") {
        await mongodbCreate();
      } else if (!emailCache && tokenStatus == "update") {
        await mongodbUpdate();
      } else if (tokenStatus == "delete") {
        if (userToken && emailCache) {
          try {
            await client.del(emailKeyName + email);
          } catch {}
        }
        await SignUpFirstStep.deleteOne({
          _id: email,
        });
      }
    };
    const finalTask = async (
      findUser: ISignUpFirstStep,
      method: TTokenStatus
    ) => {
      if (method === "update" && findUser.numOfSendToken == 4) {
        await manageToken(findUser, method);
        return holdTime(new Date(currentTimeMs + wait * 60 * 60 * 1000));
      }
      const { randomString, token } = newToken();
      await sendToken(randomString);
      findUser.token = token;
      await manageToken(findUser, method);
    };
    if (userToken) {
      let { reTry, token: clientToken, numOfSendToken } = findUser;
      holdTime(reTry);

      if (validCode) {
        try {
          const storedToken = Jwt.verify(
            clientToken,
            jwtSecretCode
          ) as IValidToken;

          if (storedToken.token === validCode) {
            const capitalizeWords = (str: string) => {
              return str.replace(/\b\w/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
                );
              });
            };
            area = capitalizeWords(area.toLowerCase().trim());
            if (mobileNo.charAt(0) === "0") {
              mobileNo = mobileNo.slice(1);
            }
            if (
              mobileNo.trim().length !== 10 ||
              pinCode.trim().length !== 6 ||
              area.length > 20
            ) {
              throw new Error("information  is incorrect");
            }
            const hashedPassword = await hash(password, 10);

            fName = capitalizeWords(fName.toLowerCase().trim());
            lName = capitalizeWords(lName.toLowerCase().trim());
            address = capitalizeWords(address.toLowerCase().trim());
            district = capitalizeWords(district.toLowerCase().trim());
            state = capitalizeWords(state.toLowerCase().trim());
            gender = capitalizeWords(gender.toLowerCase().trim());

            const findLastId = await AdditionalInfo.findByIdAndUpdate(
              docId,
              {
                $inc: { lastUserId: 1 },
              },
              {
                projection: {
                  lastUserId: 1,
                },
              }
            );

            if (!findLastId) {
              throw new Error("last id not fetching");
            }
            try {
              findLastId.lastUserId += 1;
              const [bYear, bMonth, bDate] = dateType.split("-");
              const userSearch: Array<ISearches> = [];

              const clientInterested = searches.filter(
                ({ byUser, identity, key }) => {
                  const obj = { byUser, identity: String(identity), key };
                  if (identity !== "category") {
                    if (byUser) {
                      userSearch.push(obj);
                    } else {
                      return obj;
                    }
                  }
                }
              );

              clientInterested.sort((a, b) => b.priority - a.priority);

              const interested: ISearches[] = clientInterested.map(
                ({ cached, priority, ...obj }) => obj as ISearches
              );
              const newSearches = [
                ...userSearch.slice(0, searchMax),
                ...interested.slice(0, interestedMax),
              ];
              const userLocation = {
                _id: new Date(),
                address,
                pinCode: Number(pinCode),
                state,
                district,
                area,
              };
              const authorizedUser: IClientSideShared = {
                _id: findLastId.lastUserId,
                fName,
                lName,
                bYear: Number(bYear),
                gender,
                searches: newSearches,
                location: [userLocation],
                cartPro: [],
              };
              const orderDocs: IOrderDocs = {
                newOrder: 0,
                canceled: 0,
                delivered: 0,
              };
              const authentication: ICommonData = {
                ...authorizedUser,
                email: storedToken.email,
                bDate: Number(bDate),
                bMonth: Number(bMonth),
                role: ["User"],
                mobileNo: Number(mobileNo),
                orderDocs,
              };

              const newData: IDBUser = {
                createdAt: new Date(),
                ...authentication,
                canceled: [],
                delivered: [],
                coupons: [],
                verification: { count: 0, expire: 0, freezed: 0, token: "" },
                password: hashedPassword,
              };

              const createData = await User.create(newData);

              const jwtInfo: IAuthJwtInfo = {
                _id: createData._id,
                role: ["User"],
                email,
                mobileNo: Number(mobileNo),
              };
              const jwtToken = Jwt.sign(jwtInfo, jwtSecretCode, authJWTOpt);

              cookie.set({
                ...locationCookie,
                value: JSON.stringify(userLocation),
              });
              cookie.set({
                ...authCookie,
                value: jwtToken,
              });

              cookie.set({
                ...orderDocsCookie,
                value: JSON.stringify(orderDocs),
              });

              await manageToken(findUser, "delete");

              if (cache) {
                try {
                  await client.setEx(
                    keyName + findLastId.lastUserId,
                    expire,
                    JSON.stringify(authentication)
                  );
                } catch (err) {}
              }
              return response(
                {
                  success: true,
                  text: "Account created successfully",
                  data: { ...authorizedUser, searches },
                  token: jwtToken,
                  numOfSendToken: 0,
                },
                201
              );
            } catch (err) {
              if (err instanceof Error) {
                await AdditionalInfo.updateOne(docId, {
                  $inc: { lastUserId: -1 },
                });
                throw new Error(err.message);
              }
            }
          } else {
            await finalTask(findUser, "update");
            return response(
              {
                numOfSendToken,
                text: `Verification code is incorrect new code sent to ${email}`,
                success: true,
                data: {} as IAuthenticatedUserData,
              },
              200
            );
          }
        } catch (err) {
          if (err instanceof Error) {
            const errMsg = err.message;
            if (errMsg !== "jwt expired") {
              throw new Error(errMsg);
            }
          }
        }
      }
      await finalTask(findUser, "update");
      return response(
        {
          success: true,
          numOfSendToken,
          text: `Token has expired New code sent to ${email}`,
          data: {} as IAuthenticatedUserData,
        },
        200
      );
    }

    await finalTask(
      { _id: email, numOfSendToken: 1 } as ISignUpFirstStep,
      "create"
    );

    return response(
      {
        success: true,
        numOfSendToken: 1,
        text: `The verification code has been sent to ${email}`,
        data: {} as IAuthenticatedUserData,
      },
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          text: error.message,
        }),
        {
          status: 200,
        }
      );
    }
  }
}
//
