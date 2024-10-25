import { verify } from "jsonwebtoken";
import errors, { ICustomError } from "@/server/utils/errorHandler";
import config from "@/server/config/config";
import { NextRequest } from "next/server";
import { serverResponse } from "@/server/utils/serverMethods";
import { IAuthJwtInfo } from "@/server/interfaces/tokens";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return serverResponse(false, "token is invalid", 400);
    const { email, mobileNo } = verify(
      token,
      config.jwtSecretCode
    ) as IAuthJwtInfo;

    return serverResponse(true, "", 200, { email, mobileNo });
  } catch (err) {
    if (err instanceof Error) {
      return serverResponse(false, errors(err as ICustomError), 400);
    }
  }
}
