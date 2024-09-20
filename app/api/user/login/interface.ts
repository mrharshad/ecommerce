import {
  ISearches as ISearchesClientSide,
  IReduxUserData,
} from "@/interfaces/userClientSide";
import { IAuthorizedUser, ITokens, TRoles } from "@/interfaces/userServerSide";

export interface IRequest {
  email: string;
  password: string;
  searches: ISearchesClientSide[];
}

export interface IFetchUserData extends IAuthorizedUser {
  password?: string;
  tokens: ITokens;
  role: Array<TRoles>;
}

export interface IResponseUserData extends IReduxUserData {
  tokens: ITokens;
}
export interface INewData extends IResponseUserData {
  _doc?: IResponseUserData;
}
export interface ISendResponse {
  success: boolean;
  text: string;
  resHoldOnVerification?: Date;
  data?: IReduxUserData;
  token?: string;
}
