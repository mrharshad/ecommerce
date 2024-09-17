export interface IItems {
  _id: number;
  name: string;
  tOfP: string;
  image: string;
  iSN: string;
  imgSetDiff: string;
  vD: string;
  current: number;
  updated: Date;
  qty: number;
  status: string;
  varDiff: string;
  couponCode: string;
}
export interface IProductOrder {
  _id: number;
  uName: string;
  address: string;
  area: string;
  pinCode: number;
  district: string;
  state: string;
  tofPay:
    | "Pay on Delivery"
    | "Credit Card"
    | "Debit Card"
    | "Net Banking"
    | "PayPal"
    | "Google Pay"
    | "UPI";

  exInfo: {
    openBox?: boolean;
    oneTime?: boolean;
    gitPack?: string;
  };
  payId?: string;
  createdAt: Date;
}
