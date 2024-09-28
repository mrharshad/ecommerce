export type IServerSearchesIdentity = string | "tOfP" | "name";
export type TRoles = "User" | "Product-Manager";

export interface IJwtTokenValue {
  _id: number;
  role: TRoles[];
}
export interface IIssues {}
export interface ISearches {
  identity: string | "tOfP" | "name";
  key: string;
  byUser: boolean;
}

export interface ITokens {
  token?: string;
  tokenExpire?: Date;
  verificationFailed?: number;
  tokensSent?: number;
  holdOnToken?: Date;
  holdOnVerification?: Date;
}
export interface ICartPro {}
export interface INewOrder {
  name: string;
}
export interface IDelivered {
  name: string;
}
export interface ICanceled {
  name: string;
}
export interface ILocation {
  _id: Date;
  address: string;
  pinCode: number;
  state: string;
  district: string;
  area: string;
}
export interface IJwtInfo {
  _id: number;
  role: TRoles[];
}

export interface IAuthorizedUser {
  _id: number;
  fName: string;
  lName: string;
  email: string;
  location: Array<{
    _id: Date;
    address: string;
    pinCode: number;
    state: string;
    district: string;
    area: string;
  }>;
  gender: string;
  bDate: number;
  bMonth: number;
  bYear: number;
  cartPro: ICartPro[];
  nOfNOrder: number;
  searches: Array<{
    identity: string | "tOfP" | "name";
    key: string;
    byUser: boolean;
  }>;
  canceled: ICanceled[];
  delivered: IDelivered[];
}
export default interface IDBUser extends IAuthorizedUser {
  password: string;
  mobileNo: number;
  role: TRoles[];
  tokens: {
    token?: string;
    tokenExpire?: Date;
    verificationFailed?: number;
    tokensSent?: number;
    holdOnToken?: Date;
    holdOnVerification?: Date;
  };
  issues: IIssues;
  createdAt: Date;
}
