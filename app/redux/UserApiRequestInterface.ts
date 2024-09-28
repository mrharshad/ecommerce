import { IServerResponse } from "@/interfaces/clientAndServer";
import {
  IAlert,
  ISearches,
  ISearchesIdentity,
  ISuggestion,
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
  isSearched: boolean;
  key: string;
  page: number;
  identity: ISearchesIdentity;
}

export interface IFetchKeyProductRes extends IServerResponse {
  resPage: number | null;
  data: Array<ISearchProduct>;
  key: string;
  isSearched: boolean;
}
