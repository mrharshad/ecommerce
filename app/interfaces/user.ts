import { INewOrder } from "@/server/interfaces/newOrder";
import { ISearchProduct } from "@/server/interfaces/product";

import {
  IClientSideShared,
  ICartPro as IServerSideCartPro,
} from "@/server/interfaces/user";

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

export interface IViewedPro {
  _id: number;
  tOfP: string;
  category: string;
  time: number;
}
export interface IFindSuggestion {
  preKey: string;
  loading: boolean;
  preCountData: number | undefined;
  changing: boolean | null;
}

export type TAlert = "Success" | "Error" | "Message";

export interface IAlert {
  type: "Success" | "Error" | "Message";
  text: string;
  duration?: "2s" | "3s" | "4s" | "5s";
}

export interface IHome {
  scrolled: number;
}
export type TPending =
  | "Cart"
  | "Category"
  | "Component"
  | "Contact"
  | "Create-Product"
  | "Order"
  | "Search-Product"
  | "Delete-Product"
  | "Login"
  | "District"
  | "Recovery-Password"
  | "Sign-Up";

export interface IStockInfoCartPro {
  state: string;
  district: string;
  qty: number;
}
export interface ICartPro extends IServerSideCartPro {
  name?: string;
  quantity: number;
  mrp: number;
  sold: number;
  imgUrl: string;
  category: string;
  brand: string;
  tOfP: string;
  imgSetKey: string;
  variantKey: string;
  discounts: Array<string>;
  stockInfo: Array<IStockInfoCartPro>;
  rating: number;
  discount: number;
}
export interface IReduxUserData
  extends Omit<IClientSideShared, "searches" | "nOfNOrder" | "cartPro"> {
  cartPro: Array<ICartPro>;
  mobileNo?: number;
  email?: string;
}

export interface IReduxUser {
  data: IReduxUserData;
  token: string | null;
  numOfCart: number;
  searchKey: string;
  searches: Array<ISearches>;
  viewedPro: Array<IViewedPro>;
  searchSort: TSearchSort;
  toggleSuggestion: IToggleSuggestion;
  storedSuggestions: ISuggestion[];
  suggestions: ISuggestion[];
  districts: string[];
  alerts: Array<{
    type: "Success" | "Error" | "Message";
    text: string;
    duration?: "2s" | "3s" | "4s" | "5s";
  }>;
  findSuggestion: IFindSuggestion;
  device: "Desktop" | "Tab" | "Mobile";
  nOfNOrder: number;
  storedProducts: ISearchProduct[];
  products: ISearchProduct[];
  proLoading: boolean;
  loadings: Array<TPending>;
  randomPage: number | null;
  urlKey: { orders: number };
}

export type TMainKeys =
  | "data"
  | "token"
  | "numOfCart"
  | "searchKey"
  | "loadings"
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
  | "randomPage"
  | "alerts"
  | "urlKey"
  | "viewedPro";
