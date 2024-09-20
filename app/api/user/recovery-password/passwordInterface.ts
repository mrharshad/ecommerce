import { IAuthorizedUser, ITokens, TRoles } from "@/interfaces/userServerSide";
import {
  ISearches as IClientSearches,
  IReduxUserData,
} from "@/interfaces/userClientSide";
import { IResponseUserData } from "../login/interface";
export interface IRequest {
  password: string;
  key: string;
  email: number;
  searches: IClientSearches[];
}

export interface IRecoveryPasswordResponse {
  success: boolean;
  data: IResponseUserData;
  text: string;
  token: string;
}
