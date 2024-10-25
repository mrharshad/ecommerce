import { Model, Schema, model, models } from "mongoose";
import { IDBProduct } from "../interfaces/product";

const productSchema = new Schema<IDBProduct>({
  _id: Number,
  name: {
    type: String,
    unique: true,
  },
  brand: String,
  tOfP: String,
  category: String,
  rating: Number,
  exInfo: [String],
  sold: Number,
  thumbnail: String,
  price: String,
  discount: Number,
  imgSetKey: String,
  imageSets: [
    {
      _id: String,
      images: [{ _id: String, url: String }],
      created: String,
    },
  ],
  variantKey: String,
  variants: [
    {
      _id: String,
      info: String,
      purchased: Number,
      discounts: Array<String>,
      options: [
        {
          _id: String,
          mrp: Number,
          loc: [String],
        },
      ],
      created: String,
    },
  ],
  description: String,
  certificates: [
    { _id: String, image: String, added: String, verified: Boolean },
  ],
  ratings: [Number],
  reviews: [
    {
      _id: Number,
      name: String,
      state: String,
      district: String,
      rating: Number,
      comment: String,
      delivered: String,
    },
  ],
  popular: Number,
  createdAt: Date,
});

const Product: Model<IDBProduct> =
  models.Product || model<IDBProduct>("Product", productSchema);

export default Product;
