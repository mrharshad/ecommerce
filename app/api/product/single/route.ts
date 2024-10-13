import { IServerResponse } from "@/interfaces/clientAndServer";
import { NextRequest } from "next/server";
import config from "@/server/config/config";
import { ISingleProduct } from "@/interfaces/productServerSide";
import client from "@/server/config/redisConnect";
import Product from "@/server/models/productModels";
import { singleProduct } from "@/server/utils/productProjection";
import { IGetProductRes } from "@/app/product/interface";
export async function GET(req: NextRequest) {
  try {
    console.log("single product api called");
    const { redisSingleProCache, redisSingleProExpire } = config;
    const searchParams = req.nextUrl.searchParams;
    const _id = +(searchParams.get("_id") as string);
    let data = {} as ISingleProduct;
    let cache: boolean | null = redisSingleProCache === "enable";
    const redisUrl = `single:${_id}`;

    if (cache) {
      try {
        const redisData = await client.get(redisUrl);
        if (redisData) {
          data = JSON.parse(redisData) as any;
          cache = null;
        }
      } catch (err) {
        cache = false;
      }
    }
    if (cache !== null) {
      data = (await Product.findById(_id, singleProduct)) as ISingleProduct;
    }
    const { name } = data || {};

    if (cache && name) {
      await client.setEx(redisUrl, redisSingleProExpire, JSON.stringify(data));
    }

    if (!name) {
      throw new Error("Product Not Found");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "",
        data,
      } as IGetProductRes),
      {
        status: 200,
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      console.log("single product api error ", err.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: err.message,
        } as IServerResponse),
        {
          status: 200,
        }
      );
    }
  }
}
