import {
  ICartPro as ICartProServer,
  IClientSideShared,
  TDataKeyChange,
} from "@/server/interfaces/user";
import {
  IActive,
  IFindSuggestion,
  ISearches,
  TAlert,
  TMainKeys,
  TPending,
} from "../interfaces/user";

import { IServerResponse } from "@/server/utils/serverMethods";
import { ICartIdentity } from "../admin/user/cart/interfaces";

export interface IMainKeyData {
  name: string;
  value: any;
}

export interface StateType {
  [key: string]: any;
}

export type INameSuggest = Array<{ name: string; identity: number }>;

export interface IMainKeyChange {
  name: TMainKeys;
  value: any;
}

export interface IDataKeyChange {
  name: TDataKeyChange;
  value: any;
}

export interface ISearchBarInput extends IFindSuggestion {
  preCountData: number;
}

export interface IFetchingFailed {
  text: string;
  type?: "Success" | "Error" | "Message";
  duration?: "2s" | "3s" | "4s" | "5s";
}

export interface IVisitState {
  [key: string]: any;
}

export interface IVisitPage {
  name: IActive;
  value?: boolean;
  active: IActive;
}

export interface IAuthenticatedUserData
  extends Omit<IClientSideShared, "searches"> {
  searches: Array<ISearches>;
}

export interface IAuthenticated {
  text: string;
  data: IAuthenticatedUserData;
  token: string;
  completed: TPending;
}

export type TNewAutoSearchIdentity = "category" | "tOfP";
export interface INewAutoSearch {
  key: string;
  identity: TNewAutoSearchIdentity;
}

export interface ICartQtyChange {
  newQty: number;
  newDiscount: number;
  cartIdentity: ICartIdentity;
}

export interface IRemoveCart {
  response: IServerResponse;
  cartInfo: ICartProServer;
}
