import { IProductOrder, IItems } from "./productOrderType";

interface ICanceledItems extends IItems {
  time: string;
}
interface ICanceled extends IProductOrder {
  items: ICanceledItems[];
}
interface IDelivered extends IProductOrder {
  items: IItems[];
}
