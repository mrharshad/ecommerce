import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";

import {
  ISearches as ISearchesClientSide,
  TSearchesIdentity,
} from "@/app/interfaces/user";

import config from "@/server/config/config";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import errors, {
  ICustomError,
  TErrorMessages,
} from "@/server/utils/errorHandler";

import { IClientSideShared, ISearches } from "@/server/interfaces/user";
import {
  INewPasswordReq,
  INewPasswordRes,
} from "@/app/admin/user/password-recovery/interface";

import {
  locationCookie,
  authCookie,
  authJWTOpt,
  orderDocsCookie,
} from "@/server/utils/tokens";
import {
  email as emailConfig,
  user,
  searches as searchesConfig,
} from "@/exConfig";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
import { IWithSecureData, withSecureData } from "@/server/utils/userProjection";

// apply api - /user/password-recovery
export async function PUT(req: NextRequest) {
  try {
    const {
      password,
      email,
      key,
      searches: clientSearches = [],
    }: INewPasswordReq = await req.json();
    dbConnect();
    const clientToken = crypto.createHash("sha256").update(key).digest("hex");
    let { cache, expire, keyName } = user;
    let { emailKeyName, emailExpire, emailCache } = emailConfig;
    const { interestedMax, searchMax } = searchesConfig;
    const { jwtSecretCode } = config;

    let findUser = {} as IWithSecureData;
    const cookie = cookies();
    const emailUrl = emailKeyName + email;
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
    const userName = findUser?.fName;
    if (findUser?._id && !userName) {
      throw new Error("token is invalid" as TErrorMessages);
    }

    if (!userName) {
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
        throw new Error("token is invalid" as TErrorMessages);
      }
    }

    const { _id, role, mobileNo, searches, verification } = findUser;
    const { expire: tokenExpire, token } = verification;

    if (token !== clientToken) {
      throw new Error("token is invalid" as TErrorMessages);
    }

    if (tokenExpire < Date.now()) {
      throw new Error("token is expired" as TErrorMessages);
    }

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
    const interestedSearches: ISearches[] = clientInterested.map(
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
        if (!interestedSearches.some((obj) => obj.key === key)) {
          interestedSearches.push(search);
        }
      }
    }

    let newDBSearches: ISearches[] = [
      ...userSearch.slice(0, searchMax),
      ...interestedSearches.slice(0, interestedMax),
    ];
    const hashedPassword = await bcrypt.hash(password, 10);

    findUser.verification = { count: 0, expire: 0, freezed: 0, token: "" };
    const updatedValue = (await User.findByIdAndUpdate(
      _id,
      {
        $set: {
          verification: findUser.verification,
          searches: newDBSearches,
          password: hashedPassword,
        },
      },
      { new: true, projection: withSecureData }
    )) as IWithSecureData;

    if (updatedValue) {
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
      if (userName) {
        try {
          await client.del(emailKeyName + email);
        } catch {}
      }
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
      const jwtInfo: IAuthJwtInfo = { _id, role, email, mobileNo };
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

      return new Response(
        JSON.stringify({
          success: true,
          message: `Password update successfully`,
          token: newJwtToken,
          data: { ...authorizedData, searches: newSearchesClientSide },
        } as INewPasswordRes),
        {
          status: 200,
        }
      );
    } else {
      throw new Error(`Password not update`);
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
