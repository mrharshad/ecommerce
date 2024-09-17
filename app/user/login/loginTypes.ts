import { IUserDataClientSide } from "@/app/api/user/login/interface";

export interface ILoginInfo {
  holdOnVerification?: Date;
  reTryForgot?: Date;
}

export interface ILoginSuccess {
  text: string;
  data: IUserDataClientSide;
  token: string;
}
export interface ILoginResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: Date;
  data: IUserDataClientSide;
  token: string;
}
