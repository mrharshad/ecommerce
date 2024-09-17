import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  IDeleteProduct,
  IDeleteProductRes,
  ISearchProduct,
  ISearchProductRes,
} from "./ProManagerApiRequestInterface";

export const searchProduct = createAsyncThunk(
  "searchProduct",
  async ({ key, page }: ISearchProduct): Promise<ISearchProductRes> => {
    const request = await fetch(`/api/search-product/key/`, {
      method: "POST",
      body: JSON.stringify({ key, page }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  }
);

export const deleteProduct = createAsyncThunk(
  "deleteProduct",
  async ({ token, _id }: IDeleteProduct): Promise<IDeleteProductRes> => {
    const request = await fetch(
      `/api/admin/p-general/delete?token=${token}&_id=${_id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    return await request.json();
  }
);
