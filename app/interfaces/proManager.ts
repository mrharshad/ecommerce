import { ICreateClientSide } from "../admin/product-manager/create/interface";
import { IManageClientSide } from "../admin/product-manager/manage/interfaces/manageClientSide";
import { IAlert } from "./user";

export interface IPreview {
  docType: "Quick" | "Every";
  device: "Mobile" | "Tablet" | "Laptop" | "Desktop";
}

export interface IListOfLocation {
  state: string;
  districts: string[];
}

export type TPending =
  | "Component"
  | "Search-Product"
  | "Delete-Product"
  | "Category"
  | "Create-Product";

export interface ILocation {
  state: string;
  district: string;
}
export interface ICommonData {
  listOfLocation: Array<{ state: string; districts: string[] }>;
  loading: TPending[];
  alerts: IAlert[];
  location: { state: string; district: string };
}
export interface IReduxProManager
  extends ICreateClientSide,
    IManageClientSide,
    ICommonData {}

export interface IMainKeyChange {
  name: string;
  value: any;
}
