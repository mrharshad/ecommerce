import { IMediumData } from "@/interfaces/productServerSide";

export interface IThumbnail {
  url: string;
  _id: string;
  update: string;
  removedId?: string;
}
export interface IManageClientSide {
  searchResult: IMediumData[];
  searchData: IMediumData[];
  public_ids: string[];
  search: null | { key: string; page: number | null };
}
