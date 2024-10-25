import { INewOrder } from "@/server/interfaces/newOrder";
import {
  IAlert,
  ICartPro as ICartClient,
  ISearches,
  ISuggestion,
  TSearchesIdentity,
  TSearchSort,
} from "../interfaces/user";
import { ISearchProduct } from "@/server/interfaces/product";
import { ICartPro as ICartServer } from "@/server/interfaces/user";
import { IServerResponse } from "@/server/utils/serverMethods";

export interface IGetDistricts {
  success: boolean;
  resState: string;
  resData: string[];
  resAlert?: IAlert;
}

export interface ISuggestionsGetRes extends IServerResponse {
  searchKey: string;
  data: Array<ISuggestion>;
}

export interface IFetchRandom {
  page: number | null;
  searches: Array<ISearches>;
}

export interface IFetchRandomRes extends IServerResponse {
  resPage: number | null;
  resSearches: Array<ISearches>;
  data: Array<ISearchProduct>;
}

export interface IFetchKeyProduct {
  key: string;
  page: number;
  identity: TSearchesIdentity;
  searchSort: TSearchSort;
}

export interface IFetchKeyProductRes extends IServerResponse {
  resPage: number | null;
  data: Array<ISearchProduct>;
  key: string;
  identity: TSearchesIdentity;
}
export interface ISetNewSearches {
  token: string;
  searches: Array<ISearches>;
}

export interface ISetNewSearchesRes extends Omit<IServerResponse, "message"> {
  message: "Search history is invalid" | string;
}

export interface IDeleteSearch {
  token: string;
  key: string;
  searches: Array<ISearches>;
}

export interface IDeleteSearchRes extends IServerResponse {
  removedSearch: ISearches;
}

export interface IFetchCartProductsRes extends IServerResponse {
  data: Array<ICartClient>;
  deletedCartPros: Array<ICartServer>;
}

export interface IRemoveCartsReq {
  token: string;
  cartsInfo: Array<ICartServer>;
}

export interface IRemoveCartsRes extends IServerResponse {}
export interface IGetUserContactsRes extends Omit<IServerResponse, "data"> {
  data?: { email: string; mobileNo: number };
}

export interface INewOrderReq {
  token: string | null;
  fullName: string;
  address: string;
  area: string;
  pinCode: number;
  district: string;
  state: string;
  openBox: boolean;
  oneTime: boolean;
  cartPro: Array<ICartClient>;
  searches: Array<ISearches>;
}

export type TNewOrderDoc = INewOrder | Array<INewOrder>;
export interface INewOrderRes extends Omit<IServerResponse, "data"> {
  newClientCartPro: Array<ICartClient>;
  newClientSearches: Array<ISearches>;
  newOrderDoc: TNewOrderDoc;
}
