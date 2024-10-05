import dbConnect from "@/server/config/dbConnect";
import User from "@/server/models/userModels";
import nodeMailer from "nodemailer";
import Jwt from "jsonwebtoken";
import client from "@/server/config/redisConnect";
import AdditionalInfo, { docId } from "@/server/models/additionalInfo";
import SignUpFirstStep from "@/server/models/signUp";
import { hash } from "bcrypt";
import { cookies } from "next/headers";
import { IRequest, ISignUpResponse, TTokenStatus } from "./interface";
import config from "@/server/config/config";
import ISignUpFirstStep from "@/server/models/signUpType";

import IDBUser, {
  IAuthentication,
  IAuthorizedUser,
  ISearches,
} from "@/interfaces/userServerSide";
import { IValidToken } from "@/app/user/sign-up/interface";
import { IReduxUserData } from "@/interfaces/userClientSide";

// apply api - /user/sign-up
export async function POST(req: Request) {
  try {
    const {
      redisSignUpCache,
      redisUserCache,
      jwtSecretCode,
      jwtExpireTime,
      smtpService,
      smtpHost,
      smtpMail,
      smtpPassword,
      smtpPort,
      cookieName,
      cookieExpire,
      searchesQty,
      interestedSearch,
      redisUserExpire,
    } = config;
    const response = (res: ISignUpResponse, status: number): Response => {
      return new Response(JSON.stringify(res), {
        status,
      });
    };
    const hostname = new URL(req.url).hostname;
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
    // let isRedis = "mongodb"; // jab redis kv ka use krenge to mongodb ki jagha par redis likhenge
    const redisCache = redisSignUpCache === "enable";
    let isRedis = redisCache;

    if (isRedis) {
      try {
        let result = (await client.get(`signUp:${email}`)) as any;
        if (result) {
          findUser = JSON.parse(result);
        }
      } catch {}
    }

    dbConnect();
    if (!findUser?._id) {
      findUser = (await SignUpFirstStep.findById(email)) as ISignUpFirstStep;
      if (!findUser?._id) {
        const registeredUser = await User.findOne({ email });

        if (registeredUser) {
          throw new Error(`already has an account created`);
        }
      } else {
        isRedis = false;
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
        token: Jwt.sign({ token: randomString, email }, jwtSecretCode, {
          expiresIn: "15m",
          algorithm: "HS256",
        }),
      };
    };

    const sendToken = async (randomString: string): Promise<void> => {
      const transporter = nodeMailer.createTransport({
        service: smtpService,
        host: smtpHost,
        port: Number(smtpPort),
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
        throw new Error(
          "There was a problem sending  verification code, please try again later"
        );
      }
    };
    const manageToken = async (
      data: ISignUpFirstStep,
      tokenStatus: TTokenStatus
    ) => {
      if (tokenStatus == "update") {
        data.numOfSendToken = data.numOfSendToken + 1;
        if (data.numOfSendToken >= 5) {
          data.reTry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
      }
      if (data.numOfSendToken >= 5) {
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
          await client.setEx(`signUp:${email}`, 86400, JSON.stringify(data));
          // await client.expire(`signUp:${email}`, 86400); //86400
        } catch (err) {
          const findEmail = await SignUpFirstStep.findById(email);

          if (findEmail) await mongodbUpdate();
          else await mongodbCreate();
        }
      };
      if (
        redisCache &&
        isRedis &&
        (tokenStatus == "create" || tokenStatus == "update")
      ) {
        await redisCreateUpdate();
      } else if (isRedis && tokenStatus == "delete") {
        try {
          await client.del(`signUp:${email}`);
        } catch {}
      } else if (!isRedis && tokenStatus == "create") {
        await mongodbCreate();
      } else if (!isRedis && tokenStatus == "update") {
        // delete data._id;
        await mongodbUpdate();
      } else if (!isRedis && tokenStatus == "delete") {
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
        return holdTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
      }
      const { randomString, token } = newToken();
      await sendToken(randomString);
      findUser.token = token;
      await manageToken(findUser, method);
    };
    if (findUser?._id) {
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

              clientInterested
                .sort((a, b) => b.priority - a.priority)
                .slice(0, interestedSearch);

              const interested: ISearches[] = clientInterested.map(
                ({ cached, priority, ...obj }) => obj as ISearches
              );
              const newSearches = [
                ...userSearch.slice(0, searchesQty),
                ...interested,
              ];
              const authorizedUser: IAuthorizedUser = {
                _id: findLastId.lastUserId,
                fName,
                lName,
                email: storedToken.email,
                bDate: Number(bDate),
                bMonth: Number(bMonth),
                bYear: Number(bYear),
                gender,
                searches: newSearches,
                location: [
                  {
                    _id: Date.now() as any,
                    address,
                    pinCode: Number(pinCode),
                    state,
                    district,
                    area,
                  },
                ],
                nOfNOrder: 0,
                cartPro: [],
              };
              const authentication: IAuthentication = {
                ...authorizedUser,
                password: hashedPassword,
                role: ["User"],
                tokens: {},
                issues: {},
              };

              const newData: IDBUser = {
                ...authentication,
                mobileNo: Number(mobileNo),
                canceled: [],
                delivered: [],
                createdAt: new Date(),
              };

              const createData = await User.create(newData);
              const jwtToken = Jwt.sign(
                {
                  _id: createData._id,
                  role: ["User"],
                },
                jwtSecretCode,
                {
                  expiresIn: jwtExpireTime,
                  algorithm: "HS256",
                }
              );
              cookies().set({
                name: cookieName,
                value: jwtToken,
                expires: new Date(
                  Date.now() + Number(cookieExpire) * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                path: "/", // all path
              });
              await manageToken(findUser, "delete");

              newData.cartPro = [];
              newData.location = createData.location;
              newData.createdAt = createData.createdAt;

              if (redisUserCache === "enable") {
                try {
                  await client.setEx(
                    `user:${findLastId.lastUserId}`,
                    redisUserExpire,
                    JSON.stringify(authentication)
                  );
                } catch (err) {}
              }
              return response(
                {
                  success: true,
                  text: "Account created successfully ",
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
                data: {} as IReduxUserData,
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
          data: {} as IReduxUserData,
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
        data: {} as IReduxUserData,
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
