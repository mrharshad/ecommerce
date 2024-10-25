import { ICommonData } from "@/app/interfaces/proManager";
import { ICategoriesInfo, IExInfoData } from "@/static-data/categoriesInfo";
export interface IDiscounts {
  min: number;
  discount: number;
}
export interface IVariantOption {
  _id: string;
  mrp: number;
  loc: string[]; // state:district:quantity
}
export interface IVariant {
  _id: string;
  info: string;
  purchased: number; // discount
  discounts: Array<{ min: number; discount: number }>;
  options: Array<{ _id: string; mrp: number; loc: string[] }>;
}
export interface ICertificates {
  name: string;
  image: string;
}

export interface IExInfo extends IExInfoData {
  value?: string;
}
export interface IImageSets {
  _id: string;
  images: string[];
}
export type TProcesses = 1 | 2 | 3 | 4 | 5;
export interface INewData {
  name: string;
  brand: string;
  tOfP: string; // Men: Football Shoes / sabse pahale kiske liye hai agar sabhi ke liye hai to sirf Football Shoes
  category: string;
  exInfo: Array<{
    // key:value
    key: string;
    required: boolean;
    sameOrder?: boolean;
    value?: string;
  }>;
  thumbnail: string;
  variants: Array<{
    _id: string;
    info: string;
    purchased: number;
    discounts: Array<{ min: number; discount: number }>;
    options: Array<{ _id: string; mrp: number; loc: string[] }>;
  }>;
  description: string;
  imgSetKey?: string;
  imageSets: Array<{ _id: string; images: string[] }>;
  variantKey?: string;
  certificates: Array<{ name: string; image: string }>;
}
export interface IDraft {
  id: number;
  data: INewData;
  update: string;
  time: string;
}

export interface ICreateClientSide {
  newData: INewData;
  drafts: IDraft[];
  openedDraft: null | number;
  incomplete: TProcesses;
  opened: TProcesses;
  categories: string[];
  fetchedCategories: ICategoriesInfo[];
}

export interface ICreateData extends ICreateClientSide, ICommonData {}

export interface IReduxCreateData {
  proManager: ICreateData;
}

export type TCreateAppMount = number | undefined | null;

export type TCreateKeys =
  | "newData"
  | "fetchedCategories"
  | "loading"
  | "listOfLocation"
  | "openedDraft"
  | "selectedLocation"
  | "incomplete"
  | "opened"
  | "location";

export type TNewProKeys =
  | "_id"
  | "name"
  | "brand"
  | "tOfP"
  | "category"
  | "thumbnail"
  | "popular"
  | "exInfo"
  | "variants"
  | "description"
  | "imgSetKey"
  | "imageSets"
  | "variantKey"
  | "certificates";

export interface IMainValueUpdate {
  name: TCreateKeys;
  value: any;
}

export interface INewProUpdate {
  name: TNewProKeys;
  value: any;
}

export interface ITypeOfProducts {
  tOfPName: string;
  requiredCertificates: string[];
  exInfoData: IExInfoData[];
}

export interface IFetchCategory {
  success: boolean;
  text: string;
  resData: ICategoriesInfo;
}

export interface ICategoryData {
  tOfProducts: string[];
  brands: string[];
}
export interface IToggleProcess {
  opened: TProcesses;
  incomplete: TProcesses;
  mainKeyFunc: (obj: IMainValueUpdate) => void;
}

export interface IUpdateSingleVariant {
  _id: string;
  newData: IVariant;
}

export interface IMainKeyChange {
  name: TCreateKeys;
  value: any;
}

export interface ICreateProduct extends INewData {
  token: string | null;
}
