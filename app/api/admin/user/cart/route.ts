import {
  ISetNewSearches,
  ISetNewSearchesRes,
} from "@/app/redux/UserApiRequestInterface";
import dbConnect from "@/server/config/dbConnect";
import { verify } from "jsonwebtoken";
import { NextRequest } from "next/server";
import config from "@/server/config/config";
import IDBUser, {
  IAuthentication,
  ICartPro,
  IJwtTokenValue,
  ISearches,
  TSearchesIdentity,
} from "@/interfaces/userServerSide";
import errors from "@/server/utils/errorHandler";
import User from "@/server/models/userModels";
import client from "@/server/config/redisConnect";
import { cookies } from "next/headers";
import { ICustomError } from "@/interfaces/clientAndServer";
import { ICartRequest, ICartResponse } from "@/app/product/interface";
import { authentication } from "@/server/utils/userProjection";
export async function PATCH(req: NextRequest) {
  try {
    const cookie = cookies();
    const {
      jwtSecretCode,
      interestedSearch,
      searchesQty,
      redisUserCache,
      redisUserExpire,
      cookieName,
    } = config;
    let cache: null | boolean = redisUserCache === "enable";
    let { token, optionId, productId, variantId }: ICartRequest =
      await req.json();
    if (!token || !optionId || !productId || !variantId) {
      throw new Error("Invalid Information");
    }
    const info = verify(token, jwtSecretCode) as IJwtTokenValue;
    dbConnect();
    const _id = info._id;
    let data = {} as IAuthentication;
    try {
      if (cache) {
        const redisData = await client.get(`user:${_id}`);
        if (redisData) {
          data = JSON.parse(redisData as any);
        }
      }
    } catch (err) {
      cache = false;
    }

    if (!data?._id) {
      data = (await User.findById(_id, authentication)) as IAuthentication;
    } else {
      cache = null;
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
      if (cache !== false) {
        try {
          data.cartPro = newCartPro;
          await client.setEx(
            `user:${_id}`,
            redisUserExpire,
            JSON.stringify(data)
          );
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
