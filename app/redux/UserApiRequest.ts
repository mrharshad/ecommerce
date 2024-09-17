import { createAsyncThunk } from "@reduxjs/toolkit";
import { IGetDistricts } from "./UserApiRequestTypes";
import { ISuggestions } from "../../interfaces/userClientSide";

export const getDistricts = createAsyncThunk(
  "getDistricts",
  async (name: string) => {
    const request = await fetch(`/api/all/districts?state=${name}`);
    return (await request.json()) as IGetDistricts;
  }
);

export const suggestionsGet = createAsyncThunk(
  "suggestionsGet",
  async (key: string) => {
    const request = await fetch(`/api/product/suggestion/${key}`);
    return (await request.json()) as {
      success: boolean;
      searchKey: string;
      data: ISuggestions[];
    };
  }
);
