import { ISuggestion } from "@/interfaces/userClientSide";
import dbConnect from "@/server/config/dbConnect";
import Product from "@/server/models/productModels";
import categoriesInfo from "@/static-data/categoriesInfo";

export async function GET() {
  try {
    dbConnect();
    const idsAndName = await Product.find({}, { _id: 1, name: 1 });
    const modifyKeys = idsAndName.map<ISuggestion>(({ _id, name }) => {
      return { identity: _id, key: name };
    });
    const categories: Array<string> = [];
    const tOfPS: Array<string> = [];
    for (let { _id, tOfProducts } of categoriesInfo) {
      categories.push(_id);
      tOfPS.push(...tOfProducts.map(({ tOfPName }) => tOfPName));
    }
    tOfPS.sort();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successful data received",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error", error);
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: 200,
        }
      );
    }
  }
}
