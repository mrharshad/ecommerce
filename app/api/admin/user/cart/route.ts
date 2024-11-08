import dbConnect from "@/server/config/dbConnect";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";
import config from "@/server/config/config";
import { ICommonData, ICartPro } from "@/server/interfaces/user";
import errors, { ICustomError } from "@/server/utils/errorHandler";
import User from "@/server/models/user";
import client from "@/server/config/redisConnect";
import { cookies } from "next/headers";

import { ICartRequest, ICartResponse } from "@/app/product/interface";

import { user } from "@/exConfig";
import { authCookie } from "@/server/utils/tokens";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";
interface IUserData {
  _id: number;
  cartPro: ICartPro[];
}
export async function PATCH(req: NextRequest) {
  try {
    const cookie = cookies();
    const cookieName = authCookie.name;
    let { cache, expire, keyName } = user;
    const { jwtSecretCode } = config;
    let { token, optionId, productId, variantId }: ICartRequest =
      await req.json();
    if (!token || !optionId || !productId || !variantId) {
      throw new Error("Invalid Information");
    }
    const info = verify(token, jwtSecretCode) as IAuthJwtInfo;
    dbConnect();
    const _id = info._id;
    let data = {} as IUserData | ICommonData;
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
      data = (await User.findById(_id, { cartPro: 1 })) as IUserData;
    }
    const { cartPro } = data || {};

    if (!cartPro) {
      cookie.delete(cookieName);
      throw new Error("token is invalid");
    }
    const findIndex = cartPro.findIndex(
      ({ _id, option, variant }) =>
        _id === productId && option === optionId && variant === variantId
    );
    let newCartPro: Array<ICartPro> = [];

    if (findIndex >= 0) {
      newCartPro = cartPro.filter((obj, index) => index !== findIndex);
    } else {
      newCartPro = [
        ...cartPro,
        {
          _id: productId,
          option: optionId,
          variant: variantId,
          added: new Date(),
        },
      ];
    }
    const update = await User.updateOne(
      { _id },
      {
        $set: {
          cartPro: newCartPro,
        },
      }
    );
    if (update.acknowledged && update.modifiedCount === 1) {
      if (cache) {
        try {
          data.cartPro = newCartPro;
          await client.setEx(keyName + _id, expire, JSON.stringify(data));
        } catch (err) {
          cookies().delete(cookieName);
          throw new Error("token is invalid");
        }
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        message:
          findIndex >= 0
            ? "Successfully removed from cart"
            : "Successfully added to cart",
        newCart: newCartPro,
      } as ICartResponse),
      {
        status: 200,
      }
    );
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
