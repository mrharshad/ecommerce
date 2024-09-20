import categoriesInfo, { ICategoriesInfo } from "@/static-data/categoriesInfo";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let { category } = await req.json();
    console.log("api called category", category);
    const categories: ICategoriesInfo[] = categoriesInfo;

    const resData = categories.find((obj) => obj._id == category);
    if (!resData) {
      throw new Error("category not found");
    }
    return new Response(
      JSON.stringify({
        success: true,
        text: "Data Send Successfully",
        resData,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          text: err.message,
        }),
        {
          status: 200,
        }
      );
    }
  }
}

// Socks: {
//   tOfPS: [

//     "Low Show",
//     "No Show",
//     "High Ankle",
//     "Knee Length",
//   ],
//   brands: ["Adidas", "Puma", "Nivia", "Sega", "Vector X"],
//   keyValueD: {
//     common: ["Material"],
//   },
//   aInfo: {
//     common: ["Country of Origin"],
//   },
//   certificate: {
//     common: [],
//   },
// },
