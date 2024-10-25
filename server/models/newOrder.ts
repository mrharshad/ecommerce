import { Model, Schema, model, models } from "mongoose";
import { INewOrder } from "../interfaces/newOrder";

const orderSchema = new Schema<INewOrder>({
  _id: Number,
  userId: Number,
  fullName: String,
  address: String,
  area: String,
  pinCode: Number,
  district: String,
  state: String,
  tofPay: String,
  payId: {
    type: String,
    required: false,
  },
  items: [
    {
      _id: Number,
      userId: Number,
      name: String,
      tOfP: String,
      imgUrl: String,
      variantKey: String,
      imgSetKey: String,
      variant: String,
      option: String,
      amount: Number,
      quantity: Number,
      status: String,
      message: String,
      update: Date,
      expected: Date,
      coupon: {
        type: String,
        required: false,
      },
    },
  ],
  openBox: Boolean,
  oneTime: Boolean,
  gitPack: {
    type: String,
    required: false,
  },
  createdAt: Date,
});

const NewOrder: Model<INewOrder> =
  models.NewOrder || model<INewOrder>("NewOrder", orderSchema);

export default NewOrder;
