import { IGetDistricts } from "@/app/redux/UserApiRequestTypes";
import districts from "@/static-data/districtsOfStatesOfIndia";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") as string;

  const stateData: { [key: string]: string[] } = districts;
  const resData = stateData[state];

  const responseSend: IGetDistricts = {
    success: true,
    resData,
    resState: state,
  };
  if (!resData) {
    responseSend.success = false;
    responseSend.resAlert = {
      type: "Error",
      text: "Please enter the correct state",
    };
  }
  return new Response(JSON.stringify(responseSend), {
    status: 200,
  });
}
