import { IPayment, TTofPay } from "./newOrder";

export type TSearchesIdentity = string | "tOfP" | "name";

export type TRoles = "User" | "Product-Manager";

export interface ISearches {
  identity: string | "tOfP" | "name";
  key: string;
  byUser: boolean;
}

export interface ICartPro {
  _id: number;
  variant: string;
  option: string;
  added: Date;
}
export interface INewOrder {
  name: string;
}
export interface IDelivered {
  name: string;
}
export interface ICanceled {
  _id: String; // order_id:product_id:variant:option
  name: string;
  reason: string;
  tofPay: TTofPay;
  refund?: IPayment;
  price: number;
  quantity: number;
  imgUrl: string;
  update: Date;
  createdAt: Date;
}
export interface ILocation {
  _id: Date;
  address: string;
  pinCode: number;
  state: string;
  district: string;
  area: string;
}
export interface IOrderDocs {
  newOrder: number;
  canceled: number;
  delivered: number;
}
export interface IClientSideShared {
  _id: number;
  fName: string;
  lName: string;
  location: Array<{
    _id: Date;
    address: string;
    pinCode: number;
    state: string;
    district: string;
    area: string;
  }>;

  gender: string;
  bYear: number;
  searches: Array<{
    identity: string | "tOfP" | "name";
    key: string;
    byUser: boolean;
  }>;
  cartPro: Array<{ _id: number; variant: string; option: string; added: Date }>;
}

export interface ICommonData extends IClientSideShared {
  email: string;
  bDate: number;
  bMonth: number;
  mobileNo: number;
  role: TRoles[];
  orderDocs: IOrderDocs;
}

export interface IAdditional {
  coupons: Array<{
    _id: string; // kiss vajah se coupon mila
    brand?: string;
    type: "Percentage" | "Flat";
    value: number;
    valid: Date;
  }>;

  canceled: Array<{
    _id: String;
    name: string;
    reason: string;
    tofPay: TTofPay;
    refund?: IPayment;
    price: number;
    quantity: number;
    imgUrl: string;
    update: Date;
    createdAt: Date;
  }>;
  delivered: Array<{
    _id: number;
    address: string;
    pinCode: number;
    area: string;
    district: string;
    state: string;
    tofPay: TTofPay;
    payment?: IPayment;
    items: Array<{
      _id: string;
      name: string;
      tOfP: string;
      imgUrl: string;
      variantKey?: string;
      imgSetKey?: string;
      price: number;
      quantity: number;
      update: Date;
      coupon?: { code: string; type: "Percentage" | "Flat"; value: number };
      deliveryAgent: number;
      rating: number;
      comment: string;
    }>;
    openBox: boolean;
    oneTime: boolean;
    createdAt: Date;
  }>;
  createdAt: Date;
}

export interface IVerification {
  token: string;
  expire: number;
  count: number;
  freezed: number;
}
export interface ISecureData {
  verification: IVerification;
  password: string;
}
export default interface IDBUser
  extends ICommonData,
    IAdditional,
    ISecureData {}

export type TDataKeyChange =
  | "fName"
  | "lName"
  | "email"
  | "location"
  | "cartPro";
