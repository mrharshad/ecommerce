import { ISearchProduct } from "./productServerSide";
import { IAuthorizedUser } from "./userServerSide";

export type IDevice = "Desktop" | "Tab" | "Mobile";

export type IActive = "productInfo" | "home" | "other";

export interface ICategories {
  name: string;
  tOfPS: string[];
}

export type ISearchSort =
  | "Low to High"
  | "High to Low"
  | "Popular"
  | "New Arrivals"
  | "Rating"
  | "Discount";
export type ISearchesIdentity = "tOfP" | "name" | number;

export type ISuggestions = { key: string; identity: ISearchesIdentity };

export type IToggleSuggestion = "0px" | "1000px";

export interface ISearches {
  key: string;
  byUser: boolean;
  update: Date;
  priority: number;
  identity: "tOfP" | "name" | number;
  cached?: Array<{ sorted: ISearchSort; page: number | null }>;
}
export interface ISearch {
  key: string;
  page: null | number;
  identity: "tOfP" | "name" | number;
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
export interface ICartPro {}
export interface IReduxUserData
  extends Omit<IAuthorizedUser, "searches" | "cartPro"> {
  cartPro: ICartPro[];
  searches: Array<{
    key: string;
    byUser: boolean;
    update: Date;
    priority: number;
    identity: "tOfP" | "name" | number;
    cached?: Array<{ sorted: ISearchSort; page: number | null }>;
  }>;
}
export interface IPageInfo {
  scrolled: number;
}
export interface IReduxUser {
  data: IReduxUserData;
  token: string | null;
  numOfCart: number;
  search: {
    key: string;
    page: null | number;
    identity: "tOfP" | "name" | number;
  };
  searches: ISearches[];
  searchSort: ISearchSort;
  toggleSuggestion: IToggleSuggestion;
  page: number | null;
  loading: boolean;
  suggestions: ISuggestions[];
  suggestion: ISuggestions[];
  districts: string[];
  alerts: IAlert[];
  findSuggestion: IFindSuggestion;
  dataEnd: boolean;
  categories: ICategories[];
  newOrder: string[];
  canceled: string[];
  delivered: string[];
  device: "Desktop" | "Tab" | "Mobile";
  nOfNOrder: number;
  active: IActive;
  home: IPageInfo;
  productInfo: IPageInfo;
  allData: ISearchProduct[];
  products: ISearchProduct[];
}
