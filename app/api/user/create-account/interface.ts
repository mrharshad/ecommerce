import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";
import { IClientResponse } from "@/app/user/sign-up/interface";
import { IReduxUserData, ISearches } from "@/interfaces/userClientSide";
import { IAuthorizedUser } from "@/interfaces/userServerSide";

export interface IResData {
  userData: IClientResponse;
  initialToken: string;
}
export interface IRequest {
  fName: string;
  lName: string;
  email: string;
  address: string;
  mobileNo: string;
  birth: { dateType: string; textType: string };
  gender: string;
  validCode: string;
  password: string;
  searches: ISearches[];
  pinCode: string;
  district: string;
  state: string;
  area: string;
}
export type TTokenStatus = "create" | "update" | "delete";

export interface ISignUpResponse {
  success: boolean;
  text: string;
  numOfSendToken: number;
  data: IAuthenticatedUserData;
  token?: string;
}
