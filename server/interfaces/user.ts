export type TSearchesIdentity = string | "tOfP" | "name";

export type TRoles = "User" | "Product-Manager";

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
export interface ICartPro {
  _id: number;
  variant: string;
  option: string;
  added: Date;
}
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

export interface IAuthorizedUser {
  _id: number;
  fName: string;
  lName: string;
  location: Array<{
    _id: Date;
    address: string;
    pinCode: number;
    state: string;
    district: string;
    area: string;
  }>;

  gender: string;
  bYear: number;
  searches: Array<{
    identity: string | "tOfP" | "name";
    key: string;
    byUser: boolean;
  }>;
  cartPro: Array<{ _id: number; variant: string; option: string; added: Date }>;
}
export interface IAuthentication extends IAuthorizedUser {
  email: string;
  bDate: number;
  bMonth: number;
  mobileNo: number;
  role: TRoles[];
  password: string;
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

export interface IUnAuthentication {
  delivered: IDelivered[];
  canceled: ICanceled[];
}
export default interface IDBUser extends IAuthentication, IUnAuthentication {}

export type TDataKeyChange =
  | "fName"
  | "lName"
  | "email"
  | "location"
  | "cartPro";
