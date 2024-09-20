import { IReduxUserData } from "@/interfaces/userClientSide";

export interface ILoginInfo {
  holdOnVerification?: Date;
  reTryForgot?: Date;
}

export interface ILoginSuccess {
  text: string;
  data: IReduxUserData;
  token: string;
}
export interface ILoginResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: Date;
  data: IReduxUserData;
  token: string;
}
