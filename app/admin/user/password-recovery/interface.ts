import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";

import { ISearches as IClientSearches } from "@/app/interfaces/user";
import { IServerResponse } from "@/server/utils/serverMethods";
import { TErrorMessages } from "@/server/utils/errorHandler";

export interface ICheckTokenValidityRes
  extends Omit<IServerResponse, "message"> {
  message: TErrorMessages | "";
}

export interface INewPasswordReq {
  password: string;
  key: string;
  email: string;
  searches: IClientSearches[];
}

export interface INewPasswordRes extends Omit<IServerResponse, "message"> {
  message: "Password update successfully" | TErrorMessages | "";
  data: IAuthenticatedUserData;
  token: string;
}
