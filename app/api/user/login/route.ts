import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import config from "@/server/config/config";

import errors, { ICustomError } from "@/server/utils/errorHandler";
import {
  ISearches as ISearchesClientSide,
  TSearchesIdentity,
} from "@/app/interfaces/user";
import {
  IAuthentication,
  IAuthorizedUser,
  ISearches,
} from "@/server/interfaces/user";

import { authentication } from "@/server/utils/userProjection";

import { IRequest, ISendResponse } from "@/app/user/login/interface";
import { authCookie, authJWTOpt, locationCookie } from "@/server/utils/tokens";
import {
  user,
  email as emailConfig,
  searches as searchesConfig,
  password as passwordConfig,
} from "@/exConfig";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";

// apply api - /user/login
export async function PUT(req: NextRequest) {
  try {
    const cookie = cookies();
    const {
      email,
      password: userEnter,
      searches: clientSearches = [],
    }: IRequest = await req.json();

    const response = (res: ISendResponse) =>
      new Response(JSON.stringify(res), {
        status: 200,
      });
    const { jwtSecretCode } = config;
    let { cache, expire, keyName } = user;
    let { emailKeyName, emailExpire } = emailConfig;
    const { interestedMax, searchMax } = searchesConfig;
    const { incorrectLimit, wait } = passwordConfig;

    let isRedis = false;
    dbConnect();
    let findUser = {} as IAuthentication;
    if (cache) {
      try {
        let result = await client.get(emailKeyName + email);

        if (result) {
          findUser = JSON.parse(result);
          isRedis = true;
        }
      } catch (err) {
        cache = false;
      }
    }
    const userName = findUser?.fName;
    if (findUser._id && !userName) {
      throw new Error("Invalid email and password");
    }
    if (!userName) {
      findUser = (await User.findOne(
        { email },
        authentication
      )) as IAuthentication;
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
        throw new Error("Invalid email and password");
      }
    }

    const {
      _id,
      role,
      password,
      searches,
      mobileNo,
      tokens = {},
    } = findUser as IAuthentication;

    let { holdOnVerification, verificationFailed = 0 } = tokens;

    if (holdOnVerification) {
      const pendingTime = new Date(holdOnVerification);
      let milliseconds = new Date().getTime() - pendingTime.getTime();
      const minutes = Math.floor(milliseconds / (1000 * 60));
      let pendingHours = Math.floor(minutes / 60);
      let pendingMinutes = minutes % 60;
      pendingHours = pendingHours < 0 ? Math.abs(pendingHours) : 0;
      pendingMinutes = pendingMinutes < 0 ? Math.abs(pendingMinutes) : 0;

      if (pendingHours || pendingMinutes) {
        if (!isRedis && cache) {
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
          text: `Try After ${pendingHours && `${pendingHours} hours`} ${
            pendingMinutes > 0 ? `: ${pendingMinutes} minutes` : ""
          } `,
          resHoldOnVerification: pendingTime,
        });
      }
    }

    const verification = await bcrypt.compare(userEnter, password as string);
    if (verification) {
      const userSearch: Array<ISearches> = [];
      const clientInterested = clientSearches.filter(
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
        ({ byUser, identity, key }) => {
          return { key, identity: String(identity), byUser };
        }
      );
      for (let search of searches) {
        const key = search.key;
        if (search.byUser) {
          if (!userSearch.some((obj) => obj.key === key)) {
            userSearch.push(search);
          }
        } else {
          if (!interested.some((obj) => obj.key === key)) {
            interested.push(search);
          }
        }
      }

      let newDBSearches: ISearches[] = [
        ...userSearch.slice(0, searchMax),
        ...interested.slice(0, interestedMax),
      ];

      const jwtInfo: IAuthJwtInfo = { _id, role, email, mobileNo };

      if (isRedis) {
        try {
          await client.del(emailKeyName + email);
        } catch {}
      }
      const updatedValue = (await User.findByIdAndUpdate(
        _id,
        {
          $set: { tokens: {}, searches: newDBSearches },
        },
        { new: true, projection: authentication }
      )) as IAuthentication;

      const {
        bYear,
        cartPro,
        fName,
        lName,
        location,
        searches: updatedSearches,
        gender,
      } = updatedValue;
      const authorizedData: IAuthorizedUser = {
        _id,
        bYear,
        cartPro,
        fName,
        gender,
        lName,
        location,
        searches: updatedSearches,
      };
      if (!fName) throw new Error("Data Base Error");
      if (cache) {
        try {
          updatedValue.tokens = {};
          await client.setEx(
            keyName + _id,
            expire,
            JSON.stringify(updatedValue)
          );
        } catch (err) {}
      }
      const newSearchesClientSide: ISearchesClientSide[] = [...clientSearches];

      updatedSearches.forEach(({ byUser, identity, key }) => {
        if (!clientSearches.find((obj) => obj.key === key)) {
          newSearchesClientSide.push({
            key,
            identity: (Number(identity) || identity) as TSearchesIdentity,
            byUser,
            priority: 1,
            cached: [{ page: 1, sorted: "Popular" }],
          });
        }
      });
      const newJwtToken = Jwt.sign(jwtInfo, jwtSecretCode, authJWTOpt);

      cookie.set({
        ...locationCookie,
        value: JSON.stringify(location[0]),
      });

      cookie.set({
        ...authCookie,
        value: newJwtToken,
      });

      return response({
        success: true,
        text: "login successful",
        token: newJwtToken,
        data: { ...authorizedData, searches: newSearchesClientSide },
      });
    } else {
      if (verificationFailed === incorrectLimit) {
        tokens.verificationFailed = 0;
        tokens.holdOnVerification = new Date(
          Date.now() + wait * 60 * 60 * 1000
        );
      } else {
        tokens.verificationFailed = verificationFailed + 1;
        if (holdOnVerification) delete tokens.holdOnVerification;
      }

      findUser.tokens = tokens;

      const tokenUpdateInDB = async () => {
        const update = await User.updateOne(
          { _id },
          {
            $set: { tokens: findUser.tokens },
          }
        );
        if (!update.modifiedCount) throw new Error("Data Base Error");
      };

      if (cache) {
        try {
          await client.setEx(
            emailKeyName + email,
            emailExpire,
            JSON.stringify(findUser)
          );
        } catch (err) {
          await tokenUpdateInDB();
        }
      } else {
        await tokenUpdateInDB();
      }

      if (tokens.holdOnVerification)
        return response({
          success: false,
          text: `try after ${wait} hours`,
          resHoldOnVerification: tokens.holdOnVerification,
        });
      else
        return response({ success: false, text: "invalid email and password" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ success: false, text: errors(error as ICustomError) }),
        {
          status: 200,
        }
      );
    }
  }
}
