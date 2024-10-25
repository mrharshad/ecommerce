import {
  IFetchRandom,
  IFetchRandomRes,
} from "@/app/redux/UserApiRequestInterface";
import { suggestedPro } from "@/exConfig";
import { ISearchProduct } from "@/server/interfaces/product";
import { TSearchesIdentity } from "@/app/interfaces/user";
import dbConnect from "@/server/config/dbConnect";
import client from "@/server/config/redisConnect";
import Product from "@/server/models/product";
import { searchProduct } from "@/server/utils/productProjection";

import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    let { suggestedCache, suggestedExpire, suggestedPerReq } = suggestedPro;

    let { page, searches } = (await req.json()) as IFetchRandom;
    page = Number(page);
    if (!Array.isArray(searches)) {
      searches = [];
    }
    const data: Array<ISearchProduct> = [];
    dbConnect();

    const cachedSearches = searches.filter(
      ({ identity, cached }) =>
        (identity === "category" || identity === "tOfP") &&
        cached.some((obj) => obj.page)
    );
    const numOfCached = cachedSearches.length;

    if (numOfCached) {
      cachedSearches.sort((a, b) => {
        const pageA =
          a.cached.find((obj) => obj.sorted === "Popular")?.page || 0;
        const pageB =
          b.cached.find((obj) => obj.sorted === "Popular")?.page || 0;
        return pageA - pageB; // Ascending order
      });
    }
    const findData = async (
      prePage: number,
      identity: TSearchesIdentity,
      key?: string
    ) => {
      let valueData: Array<ISearchProduct> = [];
      const skipIndex = (prePage - 1) * suggestedPerReq;
      const redisKey = key ? `${identity}:${key}` : `random:product`;
      if (suggestedCache) {
        try {
          // valueData = (await client.lRange(
          //   redisKey,
          //   skipIndex,
          //   skipIndex + productPerReq - 1
          // )) as any;
        } catch (err) {
          suggestedCache = false;
        }
      }
      let dataQty = valueData.length;

      if (dataQty) {
        valueData = valueData.map((obj) => JSON.parse(obj as any));
      } else {
        valueData = await Product.find(
          {
            [identity]: key || {
              $regex: "",
            },
          },
          searchProduct
        )
          .sort({ [key ? "sold" : "popular"]: -1, _id: 1 })
          .skip(skipIndex)
          .limit(suggestedPerReq)
          .exec();
        dataQty = valueData.length;

        if (dataQty > 0 && suggestedCache) {
          try {
            if (prePage === 1) {
              await client.lPush(
                redisKey,
                valueData.map((obj) => JSON.stringify(obj))
              );
              await client.expire(redisKey, suggestedExpire);
            } else {
              await client.rPushX(
                redisKey,
                valueData.map((obj) => JSON.stringify(obj))
              );
            }
          } catch (err) {}
        }
      }

      if (dataQty > 0) {
        if (identity === "name") {
          const ids = data.map(({ _id }) => _id);
          data.push(...valueData.filter((pro) => !ids.includes(pro._id)));
        } else {
          data.push(...valueData);
        }
      }

      return dataQty === suggestedPerReq ? prePage + 1 : null;
    };

    let loop = 0;
    while (loop < suggestedPerReq) {
      const { cached = [], key, identity } = cachedSearches[loop] || {};
      const prePage = cached.find((obj) => obj.sorted === "Popular")?.page;

      if (!key || data.length >= suggestedPerReq) break;

      if (prePage) {
        const nextPage = await findData(prePage, identity, key);

        const index = searches.findIndex((obj) => obj.key === key);
        searches[index].cached = [
          ...cached.map((obj) => {
            if (obj.sorted === "Popular") {
              return { ...obj, page: nextPage };
            } else {
              return obj;
            }
          }),
        ];
      }

      loop++;
    }

    if (page && data.length < suggestedPerReq) {
      page = await findData(page, "name");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        resPage: page,
        resSearches: searches,
      } as IFetchRandomRes),
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
