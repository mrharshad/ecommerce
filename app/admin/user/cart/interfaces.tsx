import { ICartPro, IStockInfoCartPro } from "@/app/interfaces/user";
import { ReactNode } from "react";

import { ICartPro as ICartProServer } from "@/server/interfaces/user";
export interface ILayoutProps {
  children: ReactNode;
}

export interface IMinMaxDayResponse {
  globalQty: number;
  minDay: string;
  maxDay: string;
}
export interface ICartIdentity {
  _id: number;
  added: Date;
}
export interface ICartProps {
  data: ICartPro;
  qtyChange: (
    newQty: number,
    newDiscount: number,
    cartIdentity: ICartIdentity
  ) => void;
  deleteCart: (cartInfo: ICartProServer) => void;
  minMaxDay: (
    stockInfo: IStockInfoCartPro[],
    quantity: number
  ) => IMinMaxDayResponse;
}

export interface INewOrderICartPro extends Omit<ICartPro, "name"> {
  name: string;
}
