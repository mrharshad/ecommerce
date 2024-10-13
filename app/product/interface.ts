import { IServerResponse } from "@/interfaces/clientAndServer";
import { IImages, ISingleProduct } from "@/interfaces/productServerSide";
import { ICartPro } from "@/interfaces/userServerSide";

export interface IProps {
  params: Record<string, string>;
  searchParams: { _id: number; k: string; v?: number; o?: number };
}

export interface IGetProductReq {}
export interface IGetProductRes extends IServerResponse {
  data: ISingleProduct;
}

export type TStarRating = 1 | 2 | 3 | 4 | 5;

export interface IClientData
  extends Omit<
    ISingleProduct,
    | "name"
    | "rating"
    | "sold"
    | "description"
    | "exInfo"
    | "ratings"
    | "reviews"
    | "certificates"
  > {}

export interface IImagesProps {
  images: IImages[];
}

export interface IHandlerProps {
  productId: number;
  tOfPName: string;
  categoryName: string;
  variantId: string;
  optionId: string;
}
export type TObserverIds = "category" | "tOfP";

export interface ICartRequest {
  productId: number;
  variantId: string;
  optionId: string;
  token: string;
}
export interface ICartResponse extends IServerResponse {
  newCart: ICartPro[];
}
