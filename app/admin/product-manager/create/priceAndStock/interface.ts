import { IListOfLocation, ILocation } from "@/interfaces/proManagerClientSide";
import {
  IImageSets,
  IMainKeyChange,
  IVariant,
  IVariantOption,
} from "../interface";
import { IAlert } from "@/interfaces/userClientSide";
export interface ISelectedVariant extends IVariant {
  optionId: string;
}
export type TData = ISelectedVariant | null;

export interface IVariantInfo {
  variant: IVariant;
  imageSets: IImageSets[];
  updatePurchased: (value: number, obj: IVariant) => void;
  createUpdateDisOpt: (min: number, dis: number, obj: IVariant) => boolean;
  removeDisOpt: (discount: number, obj: IVariant) => void;
  setOptionDataFunc: (data: ISelectedVariant) => void;
}
export interface IStocks {
  state: string;
  districts: Array<{ name: string; stock: number }>;
}
export interface IOptionInfoProps {
  data: TData;
  setData: (data: null) => void;
  listOfLocation: Array<IListOfLocation>;
  location: ILocation;
  mainKeyChangeFunc: (obj: IMainKeyChange) => void;
  newAlertFunc: (obj: IAlert) => void;
  updateOption: (
    mrp: number,
    data: ISelectedVariant,
    updatedStocks: IStocks[]
  ) => boolean;
}

export interface IInfoData {
  [state: string]: Array<{ name: string; stock: number }>;
}
