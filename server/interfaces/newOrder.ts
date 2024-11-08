export type TStatus =
  | "Pending"
  | "Conformed"
  | "Dispatched"
  | "Out for Delivery"
  | "Delivery Delayed";

export interface IPayment {
  _id: string;
  status: ["Pending", "Completed", "Failed"];
  time: Date;
  amount: number;
}

export type TTofPay =
  | "Pay on Delivery"
  | "Credit Card"
  | "Debit Card"
  | "Net Banking"
  | "PayPal"
  | "Google Pay"
  | "UPI";
export interface IItems {
  _id: string; // product_id:variant:option
  name: string;
  tOfP: string;
  imgUrl: string;
  variantKey?: string;
  imgSetKey?: string;
  price: number;
  quantity: number;
  status: TStatus;
  message: string;
  update: Date;
  expected: Date;
  coupon?: { _id: "Percentage" | "Flat"; code: string; value: number };
}
export interface INewOrder {
  _id: number;
  userId: number;
  fullName: string;
  mobileNo: number;
  email: string;
  address: string;
  area: string;
  pinCode: number;
  district: string;
  state: string;
  tofPay: TTofPay;
  payment?: IPayment;

  verification?: {
    _id: number;
    token: string;
    expired: Date;
    sent: number;
    hold?: Date;
  };

  items: Array<{
    _id: string;
    name: string;
    tOfP: string;
    imgUrl: string;
    variantKey?: string;
    imgSetKey?: string;
    price: number;
    quantity: number;
    status: TStatus;
    message: string;
    update: Date;
    expected: Date;
    coupon?: { _id: "Percentage" | "Flat"; code: string; value: number };
  }>;

  openBox: boolean;
  oneTime: boolean;
  createdAt: Date;
}
