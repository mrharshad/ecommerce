import { ISuggestion } from "@/interfaces/userClientSide";
import searchProductsName from "@/static-data/searchProductsName";
import searchTOfProduct from "@/static-data/searchTOfProduct";

// apply api  - header.js
interface IContext {
  params: { key: string };
}
export async function GET(req: Request, context: IContext) {
  try {
    const searchKey = context.params.key;
    let tOfPData = searchTOfProduct;
    let nameData = searchProductsName;

    const regex = new RegExp(searchKey, "i");
    const data = tOfPData
      .flatMap<ISuggestion>((key) => {
        if (regex.test(key) || searchKey.includes(key)) {
          return { key, identity: "tOfP" };
        } else return [];
      })
      .slice(0, 200);
    if (data.length < 10) {
      const names = nameData.filter((obj) => regex.test(obj.key));
      data.push(...names);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        searchKey,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
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
