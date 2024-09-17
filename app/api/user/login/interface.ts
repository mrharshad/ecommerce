"@/server/models/userModelsType";

import {
  ISearches as ISearchesClientSide,
  IReduxUserData,
} from "@/interfaces/userClientSide";
import {
  ICanceled,
  ICartPro,
  IDelivered,
  IIssues,
  ILocation,
  ISearches,
  ITokens,
  TRoles,
} from "@/interfaces/userServerSide";

export interface IRequest {
  email: string;
  password: string;
  searches: ISearchesClientSide[];
}

export interface ICommonData {
  _id: number;
  fName: string;
  lName: string;
  email: string;
  mobileNo: number;
  role: TRoles[];
  location: ILocation[];
  gender: string;
  bDate: number;
  bMonth: number;
  bYear: number;
  cartPro: ICartPro[];
  nOfNOrder: number;
  canceled: ICanceled[];
  delivered: IDelivered[];
  createdAt: Date;
}

export interface IDocData extends ICommonData {
  searches: ISearchesClientSide[];
}
export interface IUserDataClientSide extends IReduxUserData {
  _doc?: IUserDataClientSide;
}
export interface IFetchUserData extends ICommonData {
  password?: string;
  searches: ISearches[];
  tokens: ITokens;
}

export interface ISendResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: Date;
  data?: IReduxUserData;
  token?: string;
}
