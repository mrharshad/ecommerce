import { IClientSearches } from "@/interfaces/userClientSide";
import { ICommonData } from "@/interfaces/userCommon";
import { IDBSearches, ITokens } from "@/interfaces/userServerSide";

export interface IRequest {
  password: string;
  key: string;
  email: number;
  searches: IClientSearches[];
}
export interface IFindUser extends ICommonData {
  password?: string;
  tokens: ITokens;
  searches: IDBSearches[];
}
export interface IResponseData extends ICommonData {
  tokens: ITokens;
  searches: IClientSearches[];
}
export interface INewData extends IResponseData {
  _doc?: IResponseData;
}
export interface IRecoveryPasswordResponse {
  success: boolean;
  data: IResponseData;
  text: string;
  token: string;
}
