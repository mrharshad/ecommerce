import { ISearchProduct } from "./productServerSide";

import { IAuthorizedUser } from "./userServerSide";

export type TDevice = "Desktop" | "Tab" | "Mobile";

export type IActive = "singlePro" | "home" | "other";

export interface ICategory {
  key: string;
  page: number | null;
}

export type TSearchSort =
  | "Low to High"
  | "High to Low"
  | "Popular"
  | "New Arrivals"
  | "Rating"
  | "Discount";
export type TSearchesIdentity = "category" | "tOfP" | "name" | number;

export interface ISearchesCached {
  page: number | null;
  sorted: TSearchSort;
}
export type ISuggestion = { key: string; identity: TSearchesIdentity };

export type IToggleSuggestion = "0px" | "1000px";

export interface ISearches {
  key: string;
  identity: "category" | "tOfP" | "name" | number;
  byUser: boolean;
  priority: number;
  cached: Array<{ sorted: TSearchSort; page: number | null }>;
}

export interface IFindSuggestion {
  preKey: string;
  loading: boolean;
  preCountData: number | undefined;
  changing: boolean | null;
}

export interface INewOrder {}
export interface IDelivered {}
export interface ICanceled {}
export interface IAlert {
  type: "Success" | "Error" | "Message";
  text: string;
  duration?: "2s" | "3s" | "4s" | "5s";
}

export interface IReduxUserData extends Omit<IAuthorizedUser, "searches"> {
  searches: Array<{
    key: string;
    byUser: boolean;
    priority: number;
    identity: "category" | "tOfP" | "name" | number;
    cached: Array<{ sorted: TSearchSort; page: number | null }>;
  }>;
}

export interface IHome {
  scrolled: number;
}
export type TPending =
  | "Component"
  | "Search-Product"
  | "Delete-Product"
  | "Category"
  | "Create-Product"
  | "Login"
  | "District"
  | "Recovery-Password"
  | "Sign-Up";

export interface IReduxUser {
  data: IReduxUserData;
  token: string | null;
  numOfCart: number;
  searchKey: string;
  searches: Array<ISearches>;
  searchSort: TSearchSort;
  toggleSuggestion: IToggleSuggestion;
  storedSuggestions: ISuggestion[];
  suggestions: ISuggestion[];
  districts: string[];
  alerts: IAlert[];
  findSuggestion: IFindSuggestion;
  newOrder: string[];
  canceled: string[];
  delivered: string[];
  device: "Desktop" | "Tab" | "Mobile";
  nOfNOrder: number;
  storedProducts: ISearchProduct[];
  products: ISearchProduct[];
  proLoading: boolean;
  loadings: Array<TPending>;
  active: IActive;

  randomPage: number | null;
}

export type TMainKeys =
  | "data"
  | "token"
  | "numOfCart"
  | "searchKey"
  | "searches"
  | "searchSort"
  | "toggleSuggestion"
  | "storedSuggestions"
  | "suggestions"
  | "districts"
  | "findSuggestion"
  | "newOrder"
  | "canceled"
  | "delivered"
  | "device"
  | "nOfNOrder"
  | "storedProducts"
  | "products"
  | "proLoading"
  | "active"
  | "randomPage";
