import {
  IFetchRandom,
  IFetchRandomRes,
} from "@/app/redux/UserApiRequestInterface";
import { ISearchProduct } from "@/interfaces/productServerSide";

import config from "@/server/config/config";
import dbConnect from "@/server/config/dbConnect";
import Product from "@/server/models/productModels";
import { NextRequest } from "next/server";
const { productPerReq } = config;
export async function PUT(req: NextRequest) {
  try {
    let { page, searches } = (await req.json()) as IFetchRandom;
    console.log("Random api page, searches", page, searches);
    page = Number(page);
    if (!Array.isArray(searches)) {
      searches = [];
    }
    const data: Array<ISearchProduct> = [];

    dbConnect();
    const findData = async (prePage: number, key?: string) => {
      let valueData: Array<ISearchProduct> = [];
      const skipIndex = (prePage - 1) * productPerReq;
      // try {
      //   valueData = await client.lrange(
      //     `${key}:${value}`,
      //     skipIndex,
      //     skipIndex + limit - 1
      //   );
      // } catch (err) {}

      let dataQty = valueData.length;

      if (!dataQty) {
        valueData = await Product.find(
          {
            [key ? "tOfP" : "name"]: key || {
              $regex: "",
            },
          },
          {
            _id: 1,
            brand: 1,
            category: 1,
            discount: 1,
            exInfo: 1,
            name: 1,
            price: 1,
            rating: 1,
            sold: 1,
            thumbnail: 1,
            tOfP: 1,
            popular: 1,
            mrp: 1,
          }
        )
          .sort({ [key ? "sold" : "popular"]: -1, _id: 1 })
          .skip(skipIndex)
          .limit(productPerReq)
          .exec();
        dataQty = valueData.length;

        if (dataQty > 0) {
          // try {
          //   if (currentPage == 1) {
          //     await client.rpush(`${key}:${value}`, ...valueData);
          //   } else {
          //     await client.rpushx(`${key}:${value}`, ...valueData);
          //     await client.expire(`${key}:${value}`, 86400); //86400
          //   }
          // } catch (err) {}
        }
      }
      if (dataQty > 0) {
        data.push(...valueData);
      }
      return dataQty === productPerReq ? prePage + 1 : null;
    };

    const intTofPLength = searches.length;

    if (intTofPLength) {
      searches.sort((a, b) => {
        const pageA =
          a.cached.find((obj) => obj.sorted === "Popular")?.page || 0;
        const pageB =
          b.cached.find((obj) => obj.sorted === "Popular")?.page || 0;
        return pageA - pageB; // Ascending order
      });
    }
    let loop = 0;
    while (loop < productPerReq) {
      const { cached, key } = searches[loop] || {};
      const previousPage = cached?.find(
        (obj) => obj.sorted === "Popular"
      )?.page;
      if (previousPage) {
        const nextPage = await findData(previousPage, key);

        searches[loop].cached = [
          ...cached.filter((obj) => obj.sorted !== "Popular"),
          { sorted: "Popular", page: nextPage },
        ];
      } else {
        page = await findData(page);
      }
      if (data.length >= productPerReq || page == null) {
        break;
      }
      loop++;
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
