import { IReduxUserData } from "@/app/interfaces/user";
import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";
import { ISearches as ISearchesClientSide } from "@/app/interfaces/user";

export interface ILoginInfo {
  holdOnVerification?: number;
  reTryForgot?: number;
}

export interface ILoginResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: number;
  data: IAuthenticatedUserData;
  token: string;
}

export interface ISendResponse {
  success: boolean;
  text: string;
  resReTryForget?: number;
}

export interface IRequest {
  email: string;
  password: string;
  searches: ISearchesClientSide[];
}

export interface ISendResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: number;
  data?: IAuthenticatedUserData;
  token?: string;
}
