import { ISearchProduct, ISingleProduct } from "@/interfaces/productServerSide";

export const searchProduct: Record<keyof ISearchProduct, 1> = Object.freeze({
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
});

export const singleProduct: Record<keyof ISingleProduct, 1> = {
  _id: 1,
  name: 1,
  brand: 1,
  tOfP: 1,
  category: 1,
  exInfo: 1,
  rating: 1,
  sold: 1,
  popular: 1,
  createdAt: 1,
  certificates: 1,
  description: 1,
  imageSets: 1,
  imgSetKey: 1,
  ratings: 1,
  reviews: 1,
  variantKey: 1,
  variants: 1,
};
