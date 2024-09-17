import { IProductOrder, IItems } from "./productOrderType";
interface INewOrderItems extends IItems {
  time: string;
}
interface ICanceled extends IProductOrder {
  items: INewOrderItems[];
}
