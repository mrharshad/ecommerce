import { IFetchCartProductsRes } from "@/app/redux/UserApiRequestInterface";

import {
  IImageSets,
  ISingleProduct,
  IVariant,
  IVariantOption,
} from "@/server/interfaces/product";
import {
  ICartPro as IClientCartPro,
  IStockInfoCartPro,
} from "@/app/interfaces/user";
import { ICartPro } from "@/server/interfaces/user";
import client from "@/server/config/redisConnect";
import Product from "@/server/models/product";
import { singleProduct } from "@/server/utils/productProjection";
import { NextRequest } from "next/server";
import { singleProduct as config } from "@/exConfig";
import { IServerResponse } from "@/server/utils/serverMethods";
export async function PATCH(req: NextRequest) {
  try {
    let cartProducts = (await req.json()) as Array<ICartPro>;
    const uniqueIds: Set<number> = new Set(cartProducts.map((obj) => obj._id));
    const ids = [...uniqueIds];
    const data: Array<IClientCartPro> = [];
    const deletedCartPros: Array<ICartPro> = [];
    const { cache, expire, keyName } = config;
    let caching: boolean = cache;

    for (let _id of ids) {
      let product: null | ISingleProduct = null;
      const redisUrl = keyName + _id;
      if (caching) {
        const redisData = await client.get(redisUrl);
        try {
          if (redisData) {
            product = JSON.parse(redisData);
          }
        } catch (err) {
          caching = false;
        }
      }
      if (!product?._id) {
        product = (await Product.findById(
          _id,
          singleProduct
        )) as ISingleProduct;
      }

      const {
        brand,
        category,
        name,
        sold,
        tOfP,
        variantKey,
        imgSetKey,
        imageSets,
        variants,
        rating,
      } = product || {};
      if (name) {
        if (caching) {
          try {
            await client.setEx(redisUrl, expire, JSON.stringify(product));
          } catch (err) {}
        }
      }
      for (let cart of cartProducts) {
        try {
          const { option, variant, _id: cartId } = cart;
          if (cartId === _id) {
            const findImgSet = imageSets.find(
              (obj) => obj._id === option
            ) as IImageSets;
            const imgUrl = findImgSet.images[0].url;
            const { discounts, options } = variants.find(
              (obj) => obj._id === variant
            ) as IVariant;
            const { loc, mrp } = options.find(
              (obj) => obj._id === option
            ) as IVariantOption;
            const stockInfo: Array<IStockInfoCartPro> = loc.map((strInfo) => {
              const [state, district, qty] = strInfo.split(":");
              return {
                state,
                district,
                qty: _id === 1 || _id === 16 ? 0 : Number(qty),
              };
            });
            const [minQty, minDiscount] = discounts[0].split(":");

            data.push({
              ...cart,
              brand,
              category,
              name,
              tOfP,
              variantKey,
              imgSetKey,
              sold,
              imgUrl,
              discounts,
              mrp,
              stockInfo,
              rating,
              quantity: Number(minQty),
              discount: Number(minDiscount),
            });
          }
        } catch (err) {
          deletedCartPros.push(cart);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "",
        data,
        deletedCartPros,
      } as IFetchCartProductsRes),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
        } as IServerResponse),
        {
          status: 200,
        }
      );
    }
  }
}
