import { IReduxUserData } from "@/app/interfaces/user";
import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";
import { ISearches as ISearchesClientSide } from "@/app/interfaces/user";

export interface ILoginInfo {
  holdOnVerification?: Date;
  reTryForgot?: Date;
}

export interface ILoginResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: Date;
  data: IAuthenticatedUserData;
  token: string;
}

import IDBUser, { ITokens } from "@/server/interfaces/user";

export interface ISendResponse {
  success: boolean;
  text: string;
  resReTryForget?: Date;
}

export interface IFindUser extends IDBUser {
  tokens: ITokens;
}
export interface IRequest {
  email: string;
  password: string;
  searches: ISearchesClientSide[];
}

export interface IResponseUserData extends IReduxUserData {
  tokens: ITokens;
}

export interface ISendResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: Date;
  data?: IAuthenticatedUserData;
  token?: string;
}
