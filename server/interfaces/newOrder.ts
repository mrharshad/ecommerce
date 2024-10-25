export type TStatus =
  | "Pending"
  | "Conformed"
  | "Dispatched"
  | "Out for Delivery"
  | "Delivery Delayed";

export interface IItems {
  _id: number;
  name: string;
  tOfP: string;
  imgUrl: string;
  variantKey: string;
  imgSetKey: string;
  variant: string;
  option: string;
  amount: number;
  quantity: number;
  status: TStatus;
  message: string;
  update: Date;
  expected: Date;
  coupon?: string;
}
export interface INewOrder {
  _id: number;
  userId: number;
  fullName: string;
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

  payId?: string;
  items: Array<{
    _id: number;
    name: string;
    tOfP: string;
    imgUrl: string;
    variantKey: string;
    imgSetKey: string;
    variant: string;
    option: string;
    amount: number;
    quantity: number;
    status: TStatus;
    message: string;
    update: Date;
    expected: Date;
    coupon?: string;
  }>;
  openBox: boolean;
  oneTime: boolean;
  gitPack?: string;
  createdAt: Date;
}
