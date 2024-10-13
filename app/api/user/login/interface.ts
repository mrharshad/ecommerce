import { IAuthenticatedUserData } from "@/app/redux/UserSliceInterface";
import {
  ISearches as ISearchesClientSide,
  IReduxUserData,
} from "@/interfaces/userClientSide";
import { ITokens } from "@/interfaces/userServerSide";

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
