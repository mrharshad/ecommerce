import { NextRequest } from "next/server";

import {
  IFetchKeyProduct,
  IFetchKeyProductRes,
} from "./../../../redux/UserApiRequestInterface";

import dbConnect from "@/server/config/dbConnect";
import Product from "@/server/models/product";
import { ISearchProduct } from "@/server/interfaces/product";
import client from "@/server/config/redisConnect";
import { keySearchPro, suggestedPro } from "@/exConfig";
export async function PUT(req: NextRequest) {
  try {
    let { identity, key, page, searchSort } =
      (await req.json()) as IFetchKeyProduct;

    page = Number(page);
    let sortBy = {};
    switch (searchSort) {
      case "Low to High":
        sortBy = { price: 1 };
        break;
      case "High to Low":
        sortBy = { price: -1 };
        break;
      case "New Arrivals":
        sortBy = { createdAt: -1 };
        break;
      case "Discount":
        sortBy = { discount: -1 };
        break;
      case "Rating":
        sortBy = { rating: -1 };
        break;
      default:
        sortBy = { popular: -1 };
    }
    const { keyExpire, keyCache, keyName, keyPerReq } = keySearchPro;

    const { suggestedCache, suggestedExpire } = suggestedPro;
    let skipIndex = (page - 1) * keyPerReq;
    const proName = identity === "name";
    let caching = proName
      ? keyCache
      : suggestedCache && searchSort === "Popular";
    let data: ISearchProduct[] = [];
    const redisKey = proName ? keyName + key : `${identity}:${key}`;

    if (caching) {
      try {
        data = (await client.lRange(
          redisKey,
          skipIndex,
          skipIndex + keyPerReq - 1
        )) as any;
      } catch (err) {
        caching = false;
      }
    }
    let dataQty = data.length;
    if (dataQty) {
      data = data.map((obj) => JSON.parse(obj as any));
    } else {
      dbConnect();
      data = await Product.find({
        [identity]: proName
          ? {
              $regex: key,
              $options: "i",
            }
          : key,
      })
        .sort(sortBy)
        .skip(skipIndex)
        .limit(keyPerReq)
        .exec();
      dataQty = data.length;

      if (dataQty > 0 && caching) {
        try {
          if (page === 1) {
            await client.lPush(
              redisKey,
              data.map((obj) => JSON.stringify(obj))
            );
            await client.expire(
              redisKey,
              proName ? keyExpire : suggestedExpire
            );
          } else {
            await client.rPushX(
              redisKey,
              data.map((obj) => JSON.stringify(obj))
            );
          }
        } catch (err) {}
      }
    }
    const resPage = dataQty < keyPerReq ? null : page + 1;

    return new Response(
      JSON.stringify({
        success: true,
        data,
        resPage,
        key,
        message: "",
        status: 200,
        identity,
      } as IFetchKeyProductRes),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          success: true,
          message: error.message,
        }),
        {
          status: 200,
        }
      );
    }
  }
}
