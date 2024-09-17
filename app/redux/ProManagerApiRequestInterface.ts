import { ISingleProduct } from "@/interfaces/productServerSide";

export interface ISearchProduct {
  key: string;
  page: number;
}
export interface ISearchProductRes {
  success: boolean;
  text: string;
  data: ISingleProduct[];
  total: number;
  searchKey: string;
  nextPage: number | null;
}

export interface IDeleteProduct {
  token: string;
  _id: number;
}
export interface IDeleteProductRes {
  success: boolean;
  text: string;
  _id: number;
}
