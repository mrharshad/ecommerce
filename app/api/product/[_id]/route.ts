import { NextRequest } from "next/server";
import { ISingleProduct } from "@/server/interfaces/product";
import client from "@/server/config/redisConnect";
import Product from "@/server/models/product";
import { singleProduct } from "@/server/utils/productProjection";
import { IGetProductRes } from "@/app/product/interface";
import { singleProduct as config } from "@/exConfig";
import { IServerResponse } from "@/server/utils/serverMethods";
export async function GET(
  req: NextRequest,
  context: {
    params: {
      _id: string;
    };
  }
) {
  try {
    const _id = +(context.params._id as string);
    let data = {} as ISingleProduct;
    const { cache, expire, keyName } = config;
    let caching: boolean | null = cache;
    const redisUrl = keyName + _id;

    if (caching) {
      try {
        const redisData = await client.get(redisUrl);
        if (redisData) {
          data = JSON.parse(redisData) as any;
          caching = null;
        }
      } catch (err) {
        caching = false;
      }
    }

    if (caching !== null) {
      data = (await Product.findById(_id, singleProduct)) as ISingleProduct;
    }
    const { name } = data || {};

    if (caching && name) {
      try {
        await client.setEx(redisUrl, expire, JSON.stringify(data));
      } catch (err) {}
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
