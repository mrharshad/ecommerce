import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import {
  INewOrderReq,
  INewOrderRes,
  TNewOrderDoc,
} from "@/app/redux/UserApiRequestInterface";
import { verify } from "jsonwebtoken";
import config from "@/server/config/config";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
import { serverResponse } from "@/server/utils/serverMethods";
import { IItems, INewOrder } from "@/server/interfaces/newOrder";
import { ICartPro, ISearches } from "@/app/interfaces/user";
import {
  deliveryTime,
  indiaOffset,
  msADay,
  user,
  searches as configSearches,
  orderManage,
} from "@/exConfig";
import { INewOrderICartPro } from "@/app/admin/user/cart-products/interfaces";
import {
  IAuthentication,
  ICartPro as IDbCartPro,
  ISearches as IDbSearches,
} from "@/server/interfaces/user";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";
import { authentication } from "@/server/utils/userProjection";
import AdditionalInfo, { docId } from "@/server/models/additionalInfo";
import { TSpecialMessages } from "@/server/utils/errorHandler";
import NewOrder from "@/server/models/newOrder";

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
            expected,
            imgUrl,
            name,
            tOfP,
            imgSetKey: imgSetKey || "",
            variantKey: variantKey || "",
            _id,
            option,
            variant,
            quantity,
            update: new Date(),
            status: "Pending",
            amount: mrp - mrp * (discount / 100) * quantity,
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
    const special: TSpecialMessages = "Try again after some time";
    if (!findLastId) {
      throw new Error(special);
    }
    let userData = {} as IAuthentication;
    let newOrderDoc = {} as TNewOrderDoc;
    try {
      newOrderDoc = await NewOrder.create({
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
        items,
        oneTime,
        createdAt: new Date(),
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

      userData = (await User.findByIdAndUpdate(
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
        },
        { new: true, projection: authentication }
      )) as IAuthentication;
      if (!userData?.fName) {
        await NewOrder.deleteOne({ _id: newOrderDoc._id });
        throw new Error(special);
      }
    } catch (err) {
      if (err instanceof Error) {
        await AdditionalInfo.updateOne(docId, {
          $inc: { lastOrderId: -1 },
        });
        throw new Error(err.message);
      }
    }
    const { cache, expire, keyName } = user;
    if (cache) {
      try {
        await client.setEx(keyName + _id, expire, JSON.stringify(userData));
      } catch (err) {}
    }
    const { expire: orderExpire, cache: orderCache, newOrders } = orderManage;

    if (orderCache) {
      try {
        const url = newOrders + _id;
        const orders = await client.lRange(url, 0, -1);
        if (orders?.length) {
          newOrderDoc = orders
            .map((strValue) => JSON.parse(strValue))
            .concat(newOrderDoc);
          await client.rPushX(url, JSON.stringify(newOrderDoc));
        } else {
          await client.lPush(url, JSON.stringify(newOrderDoc));
          await client.expire(url, orderExpire);
        }
        client.quit();
      } catch {}
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order has been successfully received",
        newClientSearches,
        newClientCartPro,
        newOrderDoc,
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
