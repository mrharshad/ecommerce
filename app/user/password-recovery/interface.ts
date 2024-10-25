import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";

import { ISearches as IClientSearches } from "@/app/interfaces/user";
import { IServerResponse } from "@/server/utils/serverMethods";

export interface ICheckTokenValidityRes
  extends Omit<IServerResponse, "message"> {
  message: "token expired" | "invalid token" | "";
}

export interface INewPasswordReq {
  password: string;
  key: string;
  email: string;
  searches: IClientSearches[];
}

export interface INewPasswordRes extends Omit<IServerResponse, "message"> {
  message:
    | "token expired"
    | "invalid token"
    | "Password update successfully"
    | "";
  data: IAuthenticatedUserData;
  token: string;
}
