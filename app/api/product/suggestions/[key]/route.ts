import { ISuggestion } from "@/interfaces/userClientSide";
import searchCategories from "@/static-data/categories";
import searchProductsName from "@/static-data/searchProductsName";
import searchTOfProduct from "@/static-data/searchTOfProduct";
import config from "@/server/config/config";
import { suggestionLimit } from "@/clientConfig";
import { ISuggestionsGetRes } from "@/app/redux/UserApiRequestInterface";
// apply api  - header.js
interface IContext {
  params: { key: string };
}
export async function GET(req: Request, context: IContext) {
  try {
    const { suggestionPerReq } = config;
    const searchKey = context.params.key;
    let tOfPData = searchTOfProduct;
    let categoriesData = searchCategories;
    let nameData = searchProductsName;

    const regex = new RegExp(searchKey, "i");

    const data = categoriesData.flatMap<ISuggestion>((key) => {
      if (regex.test(key) || searchKey.includes(key)) {
        return { key, identity: "category" };
      } else return [];
    });

    if (data.length < suggestionLimit) {
      const tOfPS = tOfPData.flatMap<ISuggestion>((key) => {
        if (regex.test(key) || searchKey.includes(key)) {
          return { key, identity: "tOfP" };
        } else return [];
      });

      data.push(...tOfPS);
      if (data.length < suggestionLimit) {
        const names = nameData.filter((obj) => regex.test(obj.key));
        data.push(...names);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.slice(0, suggestionPerReq),
        searchKey,
      } as ISuggestionsGetRes),
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
