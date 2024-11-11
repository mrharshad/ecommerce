import { IGetNewOrdersResponse } from "@/app/admin/user/new-orders/interface";
import { orderManage } from "@/exConfig";
import config from "@/server/config/config";
import client from "@/server/config/redisConnect";
import { INewOrder } from "@/server/interfaces/newOrder";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
import NewOrder from "@/server/models/newOrder";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const token = ((await req.json()) as { token: string }).token;
    const { jwtSecretCode } = config;
    const userId = (verify(token as string, jwtSecretCode) as IAuthJwtInfo)
      ?._id;

    let data: Array<INewOrder> = [];
    let { cache, newOrders, expire } = orderManage;
    const url = newOrders + userId;

    if (cache) {
      try {
        data = (await client.lRange(url, 0, -1)).map((strOrder) =>
          JSON.parse(strOrder)
        );
      } catch (err) {
        cache = false;
      }
    }

    if (!data.length) {
      data = await NewOrder.find({ userId });
      if (cache) {
        try {
          await client.rPush(
            url,
            data.map((order) => JSON.stringify(order))
          );
          await client.expire(url, expire);
        } catch {}
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        data,
      } as IGetNewOrdersResponse),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: (err as Error).message,
      } as any as IGetNewOrdersResponse),
      {
        status: 200,
      }
    );
  }
}
