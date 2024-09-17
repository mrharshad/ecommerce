import { IFindSuggestion } from "../../interfaces/userClientSide";

export interface IMainKeyData {
  name: string;
  value: any;
}

export interface StateType {
  [key: string]: any;
}

export type INameSuggest = Array<{ name: string; identity: number }>;

export interface IMainKeyChange {
  name: string;
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
