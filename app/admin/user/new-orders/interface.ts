import { INewOrder } from "@/server/interfaces/newOrder";
import { IServerResponse } from "@/server/utils/serverMethods";

export interface IGetNewOrdersResponse extends Omit<IServerResponse, "data"> {
  data: INewOrder[];
}

export interface ICancelProps {
  params: Record<string, string>;
  searchParams: { orderId: number; _id: string };
}

export interface ICancelRequest {
  token: string;
  orderId: number;
  _id: string;
  reason: string;
}

export interface INewOrdersParams {
  params: {};
  searchParams: { docs: number };
}
export interface INewOrdersClientParams {
  docs: number;
}
