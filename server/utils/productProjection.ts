import { ISearchProduct } from "@/interfaces/productServerSide";

export const searchProduct: Record<keyof ISearchProduct, 1> = {
  _id: 1,
  name: 1,
  brand: 1,
  tOfP: 1,
  category: 1,
  discount: 1,
  exInfo: 1,
  price: 1,
  rating: 1,
  sold: 1,
  thumbnail: 1,
  popular: 1,
  mrp: 1,
  createdAt: 1,
};
