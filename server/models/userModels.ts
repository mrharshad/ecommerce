import IDBUser from "@/interfaces/userServerSide";
import { Model, Schema, model, models } from "mongoose";

const itemsStructure = {
  _id: Number,
  name: String,
  tOfP: String,
  image: String,
  iSN: String,
  imgSetDiff: String,
  vD: String,
  current: Number,
  updated: Date,
  qty: Number,
  status: String,
  varDiff: String,
  couponCode: String,
};
const ordersStructure = {
  _id: Number,
  uName: String,
  address: String,
  area: String,
  pinCode: Number,
  district: String,
  state: String,
  tofPay: {
    type: String,
    enum: [
      "Pay on Delivery",
      "Credit Card",
      "Debit Card",
      "Net Banking",
      "PayPal",
      "Google Pay",
      "UPI",
    ],
  },
  exInfo: {
    openBox: Boolean,
    oneTime: Boolean,
    gitPack: String,
  },
  payId: String,
  createdAt: Date,
};
const orderCanceled = {
  ...ordersStructure,
  items: { ...itemsStructure, time: String },
};
const orderDelivered = { ...ordersStructure, items: { ...itemsStructure } };
const userSchema = new Schema<IDBUser>({
  _id: Number,
  fName: String,
  lName: String,
  email: String,
  password: String,
  mobileNo: Number,
  role: [String],
  location: [
    {
      _id: Date,
      address: String,
      pinCode: Number,
      state: String,
      district: String,
      area: String,
    },
  ],
  cartPro: [
    {
      _id: Number,
      variant: String,
      option: String,
      added: Date,
    },
  ],
  gender: String,
  bDate: Number,
  bMonth: Number,
  bYear: Number,
  searches: [
    {
      _id: false,
      key: String,
      byUser: Boolean,
      identity: String,
      update: Date,
    },
  ],
  nOfNOrder: Number,
  // default: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
  tokens: {},
  issues: {},
  createdAt: Date,
  canceled: [orderCanceled],
  delivered: [orderDelivered],
});

const User: Model<IDBUser> = models.User || model<IDBUser>("User", userSchema);

export default User;
