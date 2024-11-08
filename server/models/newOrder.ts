import { Model, Schema, model, models } from "mongoose";
import { INewOrder, TTofPay } from "../interfaces/newOrder";

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
const verificationSchema = new Schema({
  _id: {
    type: Number,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expired: {
    type: Date,
    required: true,
  },
  sent: {
    type: Number,
    required: true,
  },
  hold: {
    type: Date,
    required: false,
  },
});
const couponSchema = new Schema({
  _id: {
    type: String,
    enum: ["Percentage", "Flat"],
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});
const orderSchema = new Schema<INewOrder>({
  _id: { type: Number, unique: true, required: true },
  userId: Number,
  fullName: String,
  mobileNo: Number,
  email: String,
  address: String,
  area: String,
  pinCode: Number,
  district: String,
  state: String,
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
  payment: { required: false, type: paymentSchema },
  verification: { required: false, type: verificationSchema },
  openBox: Boolean,
  oneTime: Boolean,
  createdAt: { type: Date, default: Date.now },
  items: [
    {
      _id: { type: String, required: true },
      name: String,
      tOfP: String,
      imgUrl: String,
      variantKey: {
        type: String,
        required: false,
      },
      imgSetKey: {
        type: String,
        required: false,
      },
      price: Number,
      quantity: Number,
      status: {
        default: "Pending",
        type: String,
        enum: [
          "Pending",
          "Conformed",
          "Dispatched",
          "Out for Delivery",
          "Delivery Delayed",
        ],
      },
      message: String,
      update: { type: Date, default: Date.now },
      expected: Date,
      coupon: {
        type: couponSchema,
        required: false,
      },
    },
  ],
});

const NewOrder: Model<INewOrder> =
  models.NewOrder || model<INewOrder>("NewOrder", orderSchema);

export default NewOrder;
