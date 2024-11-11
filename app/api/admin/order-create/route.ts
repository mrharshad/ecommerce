import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import {
  INewOrderReq,
  INewOrderRes,
} from "@/app/redux/UserApiRequestInterface";
import { verify } from "jsonwebtoken";
import config from "@/server/config/config";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
import { serverResponse } from "@/server/utils/serverMethods";
import { IItems } from "@/server/interfaces/newOrder";
import { ICartPro, ISearches } from "@/app/interfaces/user";
import {
  deliveryTime,
  indiaOffset,
  msADay,
  user,
  searches as configSearches,
  orderManage,
} from "@/exConfig";
import { INewOrderICartPro } from "@/app/admin/user/cart/interfaces";
import IDBUser, { ISearches as IDbSearches } from "@/server/interfaces/user";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";

import AdditionalInfo, { docId } from "@/server/models/additionalInfo";
import { TErrorMessages } from "@/server/utils/errorHandler";
import NewOrder from "@/server/models/newOrder";
import { cookies } from "next/headers";
import { orderDocsCookie } from "@/server/utils/tokens";
import { commonData } from "@/server/utils/userProjection";

export async function POST(req: NextRequest) {
  try {
    const {
      token,
      address,
      area,
      cartPro,
      district,
      fullName,
      oneTime,
      openBox,
      pinCode,
      state,
      email,
      mobileNo,
      searches = [],
    }: INewOrderReq = await req.json();
    const { jwtSecretCode } = config;
    const _id = (verify(token as string, jwtSecretCode) as IAuthJwtInfo)?._id;

    const { districtMaxTime, stateMaxTime, countryMaxTime } = deliveryTime;
    const newClientCartPro: Array<ICartPro> = [];
    const tOfPS: Array<string> = [];

    const items: Array<IItems> = (cartPro as Array<INewOrderICartPro>).flatMap(
      (obj) => {
        const {
          _id,
          discount,
          imgSetKey,
          imgUrl,
          mrp,
          option,
          quantity,
          stockInfo,
          variant,
          name,
          variantKey,
          tOfP,
        } = obj;
        let stateQty = 0;
        let globalQty = 0;
        let districtQty = 0;
        stockInfo.forEach(({ district, qty, state }) => {
          const convert = Number(qty);
          if (state === state) {
            stateQty += convert;
          }
          if (district === district) {
            districtQty += convert;
          }
          globalQty += convert;
        });

        let max = countryMaxTime;
        if (districtQty >= quantity) {
          max = districtMaxTime;
        } else if (stateQty >= quantity) {
          max = stateMaxTime;
        }

        let expected = new Date(Date.now() + indiaOffset + msADay * max);
        if (globalQty < quantity) {
          newClientCartPro.push(obj);
          return [];
        } else {
          tOfPS.push(tOfP);
          return {
            _id: `${_id}:${variant}:${option}`,
            expected,
            imgUrl,
            name,
            tOfP,
            imgSetKey,
            variantKey,
            quantity,
            update: new Date(),
            status: "Pending",
            price: mrp - mrp * (discount / 100),
            message: "",
          };
        }
      }
    );
    const newClientSearches: Array<ISearches> = [];
    for (let search of searches) {
      const { byUser, key } = search;
      if (!byUser && !tOfPS.includes(key)) {
        newClientSearches.push(search);
      }
    }
    if (
      !items.length ||
      String(pinCode).length !== 6 ||
      !fullName ||
      !address ||
      !area ||
      !state ||
      !district
    ) {
      throw new Error("invalid information");
    }

    dbConnect();
    const findLastId = await AdditionalInfo.findByIdAndUpdate(
      docId,
      {
        $inc: { lastOrderId: 1 },
      },
      {
        projection: {
          lastOrderId: 1,
        },
      }
    );
    const special: TErrorMessages = "Try again after some time";
    if (!findLastId) {
      throw new Error(special);
    }

    try {
      let newOrderDoc = await NewOrder.create({
        _id: findLastId.lastOrderId + 1,
        userId: _id,
        fullName,
        address,
        area,
        tofPay: "Pay on Delivery",
        district,
        state,
        pinCode,
        openBox,
        oneTime,
        email,
        mobileNo,
        createdAt: new Date(),
        items,
      });
      if (!newOrderDoc) throw new Error(special);

      const { interestedMax, searchMax } = configSearches;
      const userSearch: Array<IDbSearches> = [];
      const clientInterested: Array<ISearches> = searches.filter(
        ({ byUser, identity, key }) => {
          const obj = { byUser, identity: String(identity), key };
          if (identity !== "category") {
            if (byUser) {
              userSearch.push(obj);
            } else {
              return identity;
            }
          }
        }
      );

      clientInterested.sort((a, b) => b.priority - a.priority);

      const userData = (await User.findByIdAndUpdate(
        _id,
        {
          $set: {
            cartPro: newClientCartPro.map(({ _id, variant, option, added }) => {
              return { _id, variant, option, added };
            }),
            searches: [
              ...userSearch.slice(0, searchMax),
              ...clientInterested
                .slice(0, interestedMax)
                .map(({ byUser, identity, key }) => {
                  return { byUser, identity: String(identity), key };
                }),
            ],
          },
          $inc: {
            "orderDocs.newOrder": 1,
          },
        },
        { new: true, projection: commonData }
      )) as IDBUser;
      if (!userData?.fName) {
        await NewOrder.deleteOne({ _id: newOrderDoc._id });
        throw new Error(special);
      }

      const { cache, expire, keyName } = user;
      if (cache) {
        try {
          await client.setEx(keyName + _id, expire, JSON.stringify(userData));
        } catch (err) {}
      }
      const { cache: orderCache, newOrders } = orderManage;
      const url = newOrders + _id;
      if (orderCache) {
        try {
          await client.rPushX(url, JSON.stringify(newOrderDoc));
          client.quit();
        } catch {}
      }
      orderDocsCookie.value = JSON.stringify(userData.orderDocs);
      cookies().set(orderDocsCookie);
    } catch (err) {
      if (err instanceof Error) {
        await AdditionalInfo.updateOne(docId, {
          $inc: { lastOrderId: -1 },
        });
        throw new Error(err.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order has been successfully received",
        newClientSearches,
        newClientCartPro,
      } as INewOrderRes),
      {
        status: 200,
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      return serverResponse(false, err.message, 400);
    }
  }
}
