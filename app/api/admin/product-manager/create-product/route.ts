import { ICreateProduct } from "@/app/admin/product-manager/create/interface";
import dbConnect from "@/server/config/dbConnect";
import Product from "@/server/models/product";

import errors, { ICustomError } from "@/server/utils/errorHandler";
import { verifyRole } from "@/server/utils/serverMethods";
import cloudinaryConfig from "@/server/config/cloudinaryConnect";
import { NextRequest } from "next/server";
import {
  IImage,
  IImageSets,
  IReviews,
  IDBProduct,
  IVariant,
} from "@/server/interfaces/product";

import AdditionalInfo, { docId } from "@/server/models/additionalInfo";
import { multipleImageDelete } from "@/server/utils/multipleImageDelete";
import { IServerResponse } from "@/server/utils/serverMethods";
import { dateFormatterNNN, dateFormatterNSN } from "@/app/utils/methods";

export interface ICreateProductRes extends IServerResponse {
  name: string;
}
export async function POST(req: NextRequest) {
  const response = ({ status, ...res }: ICreateProductRes): Response => {
    return new Response(JSON.stringify(res), {
      status,
    });
  };
  const public_ids: Array<string> = [];
  try {
    let {
      token,
      name,
      brand,
      tOfP,
      category,
      exInfo,
      thumbnail,
      variants,
      description,
      imgSetKey,
      imageSets,
      variantKey,
      certificates,
    }: ICreateProduct = await req.json();
    name = name.trim();
    //------------- Checks ---------------
    const role = verifyRole(token, "Product-Manager");
    if (!role) {
      return response({
        success: false,
        message: "Not Found",
        status: 404,
        name: "",
      });
    }
    dbConnect();
    const findProduct = await Product.findOne({ name });
    if (findProduct)
      throw new Error(`There's already a product called ${name}`);
    const todayNumStrNum = dateFormatterNSN(new Date());
    const todayOnlyNum = dateFormatterNNN(new Date());
    const newVariants: Array<IVariant> = variants.map(
      ({ discounts, ...doc }) => {
        return {
          ...doc,
          discounts: discounts.map(({ min, discount }) => `${min}:${discount}`),
          created: todayNumStrNum,
        };
      }
    );

    const imagesLinks: Array<IImageSets> = [];
    for (let data of imageSets) {
      const { _id, images } = data;
      let newImages: Array<IImage> = [];
      for (let img of images) {
        try {
          const result = await cloudinaryConfig.uploader.upload(img, {
            folder: "Product",
          });

          const { public_id, secure_url } = result;
          public_ids.push(public_id);
          newImages.push({
            _id: public_id,
            url: secure_url,
          });
        } catch {
          throw new Error(
            `Image set: Error uploading ${
              images.findIndex((image) => image === image) + 1
            }th image of ${_id} color`
          );
        }
      }
      imagesLinks.push({
        _id,
        images: newImages,
        created: todayNumStrNum,
      });
    }

    const findLastId = await AdditionalInfo.findByIdAndUpdate(
      docId,
      {
        $inc: { lastProductId: 1 },
      },
      {
        projection: {
          lastProductId: 1,
        },
      }
    );

    if (!findLastId) {
      throw new Error("last id not fetching");
    }

    const { discounts, options } = variants[0];
    const mrp = options[0].mrp;
    const discount = discounts[0].discount;
    const price = +(mrp - mrp * (discount / 100)).toFixed();

    try {
      findLastId.lastProductId += 1;
      const newProduct = await Product.create({
        _id: findLastId.lastProductId,
        name,
        brand,
        tOfP,
        category,
        rating: 0,
        sold: 0,
        exInfo: exInfo.map(({ key, value }) => `${key}:${value}`),
        thumbnail,
        price,
        mrp: mrp.toLocaleString("en-IN"),
        discount,
        imgSetKey: imgSetKey || "",
        imageSets: imagesLinks,
        variantKey: variantKey || "",
        variants: newVariants,
        description,
        certificates: certificates.map(({ name, image }) => {
          return { _id: name, image, added: todayOnlyNum, verified: false };
        }),
        reviews: [] as IReviews[],
        popular: 0,
        createdAt: new Date(),
        stars: { one: 0, two: 0, three: 0, four: 0, five: 0 },
      } as IDBProduct);
    } catch (err) {
      if (err instanceof Error) {
        const decrees = await AdditionalInfo.updateOne(docId, {
          $inc: { lastProductId: -1 },
        });
        if (decrees.modifiedCount !== 1) {
          err.message = "id of product not reduced from database";
        }
        throw new Error(err.message);
      }
    }
    return response({
      success: true,
      message: "Product Created Successfully",
      status: 200,
      name,
    });
  } catch (error) {
    if (public_ids.length) {
      await multipleImageDelete(public_ids);
    }
    return response({
      success: false,
      message: errors(error as ICustomError),
      status: 300,
      name: "",
    });
  }
}
