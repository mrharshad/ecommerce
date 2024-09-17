import IDBUser, { ITokens } from "@/interfaces/userServerSide";

export interface ISendResponse {
  success: boolean;
  text: string;
  resReTryForget?: Date;
}

export interface IFindUser extends IDBUser {
  tokens: ITokens;
}
