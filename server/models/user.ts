import { TTofPay } from "../interfaces/newOrder";
import IDBUser, { IVerification } from "../interfaces/user";
import { Model, Schema, model, models } from "mongoose";
const orderDocsSchema = new Schema({
  newOrder: Number,
  canceled: Number,
  delivered: Number,
});
const tokenInfoSchema = new Schema({
  token: String,
  expire: Number,
  count: Number,
  freezed: Number,
});
const paymentSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
});
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
  // default: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
  orderDocs: {
    _id: false,
    type: orderDocsSchema,
    required: true,
  },
  coupons: [
    {
      _id: String,
      brand: String,
      type: {
        type: String,
        enum: ["Percentage", "Flat"],
      },
      value: Number,
      valid: Date,
    },
  ],

  verification: {
    _id: false,
    type: tokenInfoSchema,
    required: true,
  },
  delivered: [],
  canceled: [
    {
      _id: String, // order_id:product_id:variant:option
      name: String,
      reason: String,
      tofPay: {
        type: String,
        default: "Pay on Delivery",
        enum: [
          "Pay on Delivery",
          "Credit Card",
          "Debit Card",
          "Net Banking",
          "PayPal",
          "Google Pay",
          "UPI",
        ] as Array<TTofPay>,
      },
      refund: { required: false, type: paymentSchema },
      price: Number,
      quantity: Number,
      imgUrl: String,
      update: Date,
      createdAt: Date,
    },
  ],
  createdAt: Date,
});

const User: Model<IDBUser> = models.User || model<IDBUser>("User", userSchema);

export default User;
