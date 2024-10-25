import { ISignUpResponse } from "@/app/api/user/create-account/interface";
import { ISearches } from "@/app/interfaces/user";

export interface IFirstStep {
  fName?: string;
  lName?: string;
  email?: string;
  gender?: "male" | "female";
  mobileNo?: number;
  birth?: { dateType: Date; textType: string };
  address?: string;
  pinCode?: number;
  state?: string;
  district?: string;
  area?: string;
  numOfSendToken: number;
  reTry: Date;
  validCode: string;
}

export interface IBirth {
  dateType: string;
  textType: string;
}

export interface IValidToken {
  token: string;
  email: string;
}
export interface IFirstStepCompleted {
  _id: number;
  fName: string;
  lName: string;
  email: string;
  mobileNo: number;
  password?: string;
  gender: string;
  tokens: {};
  issues: {};
  token: string;
  numOfSendToken: number;
  reTry: Date;
  validCode: string;
  searches: ISearches[];
  birth: IBirth;
  state: string;
}
export interface IClientResponse extends ISignUpResponse {
  token: string;
}
