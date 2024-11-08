import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import config from "@/server/config/config";

import errors, {
  ICustomError,
  TErrorMessages,
} from "@/server/utils/errorHandler";
import {
  ISearches as ISearchesClientSide,
  TSearchesIdentity,
} from "@/app/interfaces/user";
import {
  IClientSideShared,
  ICommonData,
  ISearches,
  IVerification,
} from "@/server/interfaces/user";

import { IRequest, ISendResponse } from "@/app/user/login/interface";
import {
  authCookie,
  authJWTOpt,
  locationCookie,
  orderDocsCookie,
} from "@/server/utils/tokens";
import {
  user,
  email as emailConfig,
  searches as searchesConfig,
  password as passwordConfig,
} from "@/exConfig";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
import {
  commonData,
  IWithSecureData,
  withSecureData,
} from "@/server/utils/userProjection";

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
    let { emailKeyName, emailExpire, emailCache } = emailConfig;
    const emailUrl = emailKeyName + email;
    const { interestedMax, searchMax } = searchesConfig;
    const { incorrectLimit, wait } = passwordConfig;
    const currentTimeMs = Date.now();
    dbConnect();
    let findUser = {} as IWithSecureData;
    if (emailCache) {
      try {
        let result = await client.get(emailUrl);
        if (result) {
          findUser = JSON.parse(result);
        }
      } catch (err) {
        emailCache = false;
      }
    }
    const { fName: userName, password: userPass } = findUser || {};
    if (findUser?._id && !userName) {
      throw new Error("Invalid email and password");
    }
    if (!userPass) {
      findUser = (await User.findOne(
        { email },
        withSecureData
      )) as IWithSecureData;
      if (!findUser?._id) {
        if (emailCache) {
          try {
            await client.setEx(
              emailUrl,
              emailExpire,
              JSON.stringify({ _id: email })
            );
          } catch {}
        }

        throw new Error("Invalid email and password");
      }
    }
    const { _id, role, password, searches, mobileNo, verification } =
      findUser as IWithSecureData;
    const { count, freezed } = verification;
    const isFreezed = freezed > currentTimeMs;
    if (isFreezed) {
      if (!userPass && emailCache) {
        try {
          await client.setEx(emailUrl, emailExpire, JSON.stringify(findUser));
        } catch {}
      }

      return response({
        success: false,
        text: "Account freezed" as TErrorMessages,
        resHoldOnVerification: freezed,
      });
    }

    const passVerification = await bcrypt.compare(
      userEnter,
      password as string
    );
    if (passVerification) {
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

      if (userPass) {
        try {
          await client.del(emailUrl);
        } catch {}
      }
      const updatedValue = (await User.findByIdAndUpdate(
        _id,
        {
          $set: {
            verification: {
              count: 0,
              expire: 0,
              freezed: 0,
              token: "",
            } as IVerification,
            searches: newDBSearches,
          },
        },
        {
          new: true,
          projection: commonData,
        }
      )) as ICommonData;
      const {
        bYear,
        cartPro,
        fName,
        lName,
        location,
        searches: updatedSearches,
        gender,
        orderDocs,
      } = updatedValue;
      const authorizedData: IClientSideShared = {
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

      cookie.set({
        ...orderDocsCookie,
        value: JSON.stringify(orderDocs),
      });

      return response({
        success: true,
        text: "login successful",
        token: newJwtToken,
        data: { ...authorizedData, searches: newSearchesClientSide },
      });
    } else {
      if (count === incorrectLimit) {
        verification.count = 0;
        verification.freezed = currentTimeMs + wait * 60 * 60 * 1000;
      } else {
        verification.count += 1;
      }
      const tokenUpdateInDB = async () => {
        const update = await User.updateOne(
          { _id },
          {
            $set: verification,
          }
        );
        if (!update.modifiedCount) throw new Error("Data Base Error");
      };
      if (emailCache) {
        findUser.verification = verification;
        try {
          await client.setEx(emailUrl, emailExpire, JSON.stringify(findUser));
        } catch (err) {
          await tokenUpdateInDB();
        }
      } else {
        await tokenUpdateInDB();
      }

      return response({
        success: false,
        text: "invalid email and password",
        resHoldOnVerification:
          verification.count === incorrectLimit
            ? verification.freezed
            : undefined,
      });
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
