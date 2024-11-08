import {
  IRemoveCartsReq,
  IRemoveCartsRes,
} from "@/app/redux/UserApiRequestInterface";
import dbConnect from "@/server/config/dbConnect";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";
import config from "@/server/config/config";
import { ICartPro, ICommonData } from "@/server/interfaces/user";
import errors, { ICustomError } from "@/server/utils/errorHandler";
import User from "@/server/models/user";
import client from "@/server/config/redisConnect";
import { cookies } from "next/headers";

import { user } from "@/exConfig";
import { authCookie } from "@/server/utils/tokens";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
interface IUserData {
  _id: number;
  cartPro: ICartPro[];
}
export async function DELETE(req: NextRequest) {
  try {
    const response = (message: string, status: number) => {
      return new Response(
        JSON.stringify({
          success: true,
          message,
        } as IRemoveCartsRes),
        {
          status,
        }
      );
    };
    let { cache, expire, keyName } = user;
    const { jwtSecretCode } = config;
    const cookieName = authCookie.name;
    const cookie = cookies();
    let { token, cartsInfo }: IRemoveCartsReq = (await req.json()) || {};
    let data = {} as IUserData | ICommonData;

    const info = verify(token, jwtSecretCode) as IAuthJwtInfo;
    dbConnect();
    const _id = info._id;

    try {
      if (cache) {
        const redisData = await client.get(keyName + _id);
        if (redisData) {
          data = JSON.parse(redisData as any);
        }
      }
    } catch (err) {
      cache = false;
    }

    if (!data?._id) {
      cache = false;
      data = (await User.findById(_id, { cartPro: 1 })) as ICommonData;
    }

    const { cartPro } = data || {};

    if (!cartPro) {
      cookie.delete(cookieName);
      throw new Error("token is invalid");
    }
    const cartIds = cartsInfo.map((obj) => obj.added);
    const newCartProducts = cartPro.filter(
      (cart) => !cartIds.includes(cart.added)
    );
    if (newCartProducts.length === cartPro.length) {
      return response(
        "This product has already been removed from your cart.",
        201
      );
    }
    const update = await User.updateOne(
      { _id },
      {
        $set: {
          cartPro: newCartProducts,
        },
      }
    );
    if (update.acknowledged && update.modifiedCount === 1) {
      if (cache) {
        try {
          data.cartPro = newCartProducts;
          await client.setEx(keyName + _id, expire, JSON.stringify(data));
        } catch (err) {
          cookies().delete(cookieName);
          throw new Error("token is invalid");
        }
      }
    } else {
      throw new Error(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }
    return response("Product removed from your cart successfully!", 200);
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
