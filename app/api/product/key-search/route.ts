import { NextRequest } from "next/server";

import {
  IFetchKeyProduct,
  IFetchKeyProductRes,
} from "./../../../redux/UserApiRequestInterface";

import config from "@/server/config/config";
import dbConnect from "@/server/config/dbConnect";
import Product from "@/server/models/productModels";
import { ISearchProduct } from "@/interfaces/productServerSide";
import client from "@/server/config/redisConnect";

export async function PUT(req: NextRequest) {
  try {
    const { productPerReq, redisProductExpire, redisProductsCache } = config;

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
    let caching = redisProductsCache === "enable" && searchSort === "Popular";
    let skipIndex = (page - 1) * productPerReq;
    const proName = identity === "name";
    let data: ISearchProduct[] = [];
    const redisKey = proName ? `searchKey:${key}` : `${identity}:${key}`;

    if (caching) {
      try {
        data = (await client.lRange(
          redisKey,
          skipIndex,
          skipIndex + productPerReq - 1
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
        .limit(productPerReq)
        .exec();
      dataQty = data.length;

      if (dataQty > 0 && caching) {
        try {
          if (page === 1) {
            await client.lPush(
              redisKey,
              data.map((obj) => JSON.stringify(obj))
            );
            await client.expire(redisKey, redisProductExpire);
          } else {
            await client.rPushX(
              redisKey,
              data.map((obj) => JSON.stringify(obj))
            );
          }
        } catch (err) {}
      }
    }
    const resPage = dataQty < productPerReq ? null : page + 1;

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
