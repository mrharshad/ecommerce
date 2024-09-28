import {
  IActive,
  IFindSuggestion,
  TMainKeys,
} from "../../interfaces/userClientSide";

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
