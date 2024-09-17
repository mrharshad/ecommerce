import { ICreateProductRes } from "./../../../api/admin/product-manager/create-product/route";
import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ICreateData, ICreateProduct, IFetchCategory } from "./interface";
import { newProDoc } from "./slice";

const fetchCategory = createAsyncThunk(
  "requiredDesc",
  async (category: string): Promise<IFetchCategory> => {
    const request = await fetch(`/api/admin/product-manager/category-info`, {
      method: "POST",
      body: JSON.stringify({ category }),
      headers: { "Content-Type": "application/json" },
    });
    return await request.json();
  }
);

const pendingCategoryFetching = (state: ICreateData) => {
  state.loading.push("Category");
};

const fulfilledCategoryFetching = (
  state: ICreateData,
  action: PayloadAction<IFetchCategory>
) => {
  const { success, text, resData } = action.payload;
  if (success) {
    state.fetchedCategories.push(resData);
    state.newData.category = resData._id;
  } else {
    state.alerts.push({ type: "Error", text, duration: "5s" });
  }
  const loadings = state.loading.filter((load) => load !== "Category");
  state.loading = loadings;
};

const rejectedCategoryFetching = (state: ICreateData) => {
  state.loading.filter((load) => load !== "Category");
};

const createProduct = createAsyncThunk(
  "createProduct",
  async (newData: ICreateProduct): Promise<ICreateProductRes> => {
    const request = await fetch(`/api/admin/product-manager/create-product`, {
      method: "POST",
      body: JSON.stringify(newData),
      headers: { "Content-Type": "application/json" },
    });
    return await request.json();
  }
);

const pendingCreateProduct = (state: ICreateData) => {
  state.loading.push("Create-Product");
};
const fulfilledCreateProduct = (
  state: ICreateData,
  action: PayloadAction<ICreateProductRes>
) => {
  const { success, message, status, name } = action.payload;
  if (success) {
    state.newData = newProDoc;
    state.incomplete = 1;
    state.opened = 1;
    const opened = state.openedDraft;
    const drafts = state.drafts;
    const findDraft = drafts.some((data) => data.id == opened);
    if (findDraft) {
      state.openedDraft = null;
      const deleteConfirmation = confirm(`Delete Draft: ${name}`);
      if (deleteConfirmation) {
        const newDrafts = drafts.filter((obj) => obj.id !== opened);
        state.drafts = newDrafts;
        localStorage.setItem("createProduct", JSON.stringify(newDrafts));
      }
    }
    state.alerts.push({ type: "Success", text: message });
  } else {
    state.alerts.push({ type: "Error", text: message, duration: "5s" });
  }
  const loadings = state.loading.filter((load) => load !== "Create-Product");
  state.loading = loadings;
};

export {
  fetchCategory,
  pendingCategoryFetching,
  fulfilledCategoryFetching,
  rejectedCategoryFetching,
  createProduct,
  pendingCreateProduct,
  fulfilledCreateProduct,
};
