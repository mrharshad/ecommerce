import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  IDeleteSearch,
  IDeleteSearchRes,
  IFetchKeyProduct,
  IFetchKeyProductRes,
  IFetchRandom,
  IFetchRandomRes,
  IGetDistricts,
  ISetNewSearches,
  ISetNewSearchesRes,
  ISuggestionsGetRes,
} from "./UserApiRequestInterface";

export const getDistricts = createAsyncThunk(
  "getDistricts",
  async (name: string) => {
    const request = await fetch(`/api/districts?state=${name}`);
    return (await request.json()) as IGetDistricts;
  }
);

export const suggestionsGet = createAsyncThunk(
  "suggestionsGet",
  async (key: string): Promise<ISuggestionsGetRes> => {
    const request = await fetch(`/api/product/suggestions/${key}`);
    return await request.json();
  }
);

export const fetchRandom = createAsyncThunk(
  "fetchRandom",
  async (query: IFetchRandom): Promise<IFetchRandomRes> => {
    const { page, searches } = query;
    const request = await fetch(`/api/product/random`, {
      method: "PUT",
      body: JSON.stringify({ page, searches }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  }
);
export const fetchKeyProduct = createAsyncThunk(
  "fetchKeyProduct",
  async (query: IFetchKeyProduct): Promise<IFetchKeyProductRes> => {
    const request = await fetch(`/api/product/key-search`, {
      method: "PUT",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  }
);

export const setNewSearches = createAsyncThunk(
  "setNewSearches",
  async (query: ISetNewSearches): Promise<ISetNewSearchesRes> => {
    const request = await fetch(`/api/admin/user/searches`, {
      method: "PATCH",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  }
);

export const deleteSearch = createAsyncThunk(
  "deleteSearch",
  async (query: IDeleteSearch): Promise<IDeleteSearchRes> => {
    const request = await fetch(`/api/admin/user/search-delete`, {
      method: "DELETE",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  }
);
