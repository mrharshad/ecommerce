import { IServerResponse } from "@/interfaces/clientAndServer";
import {
  IAlert,
  ISearches,
  ISuggestion,
  TSearchesIdentity,
  TSearchSort,
} from "../../interfaces/userClientSide";
import { ISearchProduct } from "@/interfaces/productServerSide";

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
