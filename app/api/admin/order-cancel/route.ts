import { NextRequest } from "next/server";
import dbConnect from "@/server/config/dbConnect";
import {
  INewOrderReq,
  INewOrderRes,
} from "@/app/redux/UserApiRequestInterface";
import { verify } from "jsonwebtoken";
import config from "@/server/config/config";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
import { IServerResponse, serverResponse } from "@/server/utils/serverMethods";
import { IItems, INewOrder } from "@/server/interfaces/newOrder";
import { searches as configSearches, orderManage } from "@/exConfig";
import IDBUser, {
  ICanceled,
  ISearches as IDbSearches,
  IOrderDocs,
} from "@/server/interfaces/user";
import client from "@/server/config/redisConnect";
import User from "@/server/models/user";

import errors, {
  ICustomError,
  TErrorMessages,
} from "@/server/utils/errorHandler";
import NewOrder from "@/server/models/newOrder";
import { cookies } from "next/headers";
import { orderDocsCookie } from "@/server/utils/tokens";
import { ICancelRequest } from "@/app/admin/user/new-orders/interface";
import { DeleteResult, startSession, UpdateQuery } from "mongoose";
import { UpdateWriteOpResult } from "mongoose";

export async function PUT(req: NextRequest) {
  try {
    let {
      token,
      _id: itemId,
      orderId,
      reason,
    }: ICancelRequest = await req.json();
    orderId = Number(orderId);
    const cookie = cookies();
    const cookieName = orderDocsCookie.name;
    const orderInfo = cookie.get(cookieName)?.value;

    let newOrder =
      (orderInfo && (JSON.parse(orderInfo) as IOrderDocs).newOrder) || 0;

    if (!newOrder) throw new Error("reload" as TErrorMessages);

    const { jwtSecretCode } = config;
    reason = reason.replace(/\s+/g, " ").trim();
    const reaLength = reason.length;
    if (reaLength > 100)
      throw new Error("Reason must not exceed 100 characters");
    if (reaLength > 100)
      throw new Error("Reason must not exceed 100 characters");

    if (reaLength < 10)
      throw new Error("Reason must be longer than 10 characters");

    const _id = (verify(token as string, jwtSecretCode) as IAuthJwtInfo)?._id;

    let { cache, newOrders, canceled } = orderManage;
    const newOrderUrl = newOrders + _id;
    let order = {} as INewOrder;
    let orders: Array<INewOrder> = [];
    if (cache) {
      try {
        const strData = await client.lRange(newOrderUrl, 0, -1);
        orders = strData.map((data) => JSON.parse(data));
      } catch {
        cache = false;
      }
      if (cache) {
        order = orders.find((order) => order._id === orderId) as INewOrder;
        if (!order._id) {
          throw new Error("reload" as TErrorMessages);
        }
      }
    }
    dbConnect();
    if (!cache) {
      order = (await NewOrder.findById(orderId)) as INewOrder;
      if (!order._id) throw new Error("reload" as TErrorMessages);
    }
    const { items, createdAt, tofPay } = order;
    const numOfItems = items.length;
    const { name, imgUrl, price, quantity } =
      items.find((obj) => obj._id === itemId) || ({} as IItems);
    if (!name) throw new Error("reload" as TErrorMessages);
    const firstObj: UpdateQuery<IDBUser> = {};

    const canceledData: ICanceled = {
      _id: `${orderId}:${itemId}`,
      name,
      reason,
      tofPay,
      price,
      quantity,
      imgUrl,
      update: new Date(),
      createdAt,
    };
    const session = await startSession();
    session.startTransaction();
    const secondObj = {
      session,
      projection: { orderDocs: 1 },
    } as any;

    if (numOfItems === 1) {
      firstObj.$inc = { "orderDocs.newOrder": -1 };
      secondObj.new = true;
    }
    try {
      const responsePromises = (await Promise.all([
        User.findByIdAndUpdate(
          _id,
          {
            $push: {
              canceled: {
                $each: [canceledData],
                $position: 0,
              },
            },
            ...firstObj,
          },
          secondObj
        ),
        numOfItems === 1
          ? NewOrder.deleteOne({ _id: orderId }, { session })
          : NewOrder.updateOne(
              { _id: orderId },
              { $pull: { items: { _id: itemId } } },
              { session }
            ),
      ])) as [
        {
          orderDocs: IOrderDocs;
        },
        DeleteResult | UpdateWriteOpResult
      ];
      const [firstRes, secondRes] = responsePromises;
      const orderDocs = firstRes?.orderDocs;

      if (
        !orderDocs ||
        (secondRes as UpdateWriteOpResult).modifiedCount === 0 ||
        (secondRes as DeleteResult).deletedCount === 0
      ) {
        await session.abortTransaction();
        throw new Error("Try again after some time" as TErrorMessages);
      }
      await session.commitTransaction();
      if (cache) {
        try {
          await Promise.all([
            client.lPushX(canceled + _id, JSON.stringify(canceledData)),
            client.del(newOrderUrl),
          ]);
        } catch (err) {}
      }
      if (numOfItems === 1) {
        cookie.set({ ...orderDocsCookie, value: JSON.stringify(orderDocs) });
      }
    } catch (err) {
      await session.abortTransaction();
      throw new Error((err as Error).message);
    }
    session.endSession();
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order canceled successfully",
      } as IServerResponse),
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error) {
      console.log("err", err.message);
      return serverResponse(false, errors(err as ICustomError), 400);
    }
  }
}
