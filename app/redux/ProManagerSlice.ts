import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  IMainKeyChange,
  IReduxProManager,
  TPending,
} from "../../interfaces/proManagerClientSide";
import {
  appMountFuc,
  deleteDraftFunc,
  draftSaveFunc,
  getDraftFunc,
  newProDocFunc,
  newProUpdateFunc,
  updateSingleVariantFunc,
} from "../admin/product-manager/create/slice";
import {
  createProduct,
  fetchCategory,
  fulfilledCategoryFetching,
  fulfilledCreateProduct,
  pendingCategoryFetching,
  pendingCreateProduct,
  rejectedCategoryFetching,
} from "../admin/product-manager/create/apiRequest";
import { IAlert } from "@/interfaces/userClientSide";

const initialState = {} as IReduxProManager;
const ProManageSlice = createSlice({
  name: "proManager",
  initialState,
  reducers: {
    mainKeyChange: (state: any, action: PayloadAction<IMainKeyChange>) => {
      const { name, value } = action.payload;
      state[name] = value;
    },
    newAlert: (state, action: PayloadAction<IAlert>) => {
      state.alerts.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      const text = action.payload;
      const alerts = state.alerts.filter((alert) => alert.text !== text);
      state.alerts = alerts;
    },
    newLoading: (state, action: PayloadAction<TPending>) => {
      state.loading.push(action.payload);
    },
    removeLoading: (state, action: PayloadAction<TPending>) => {
      const remove = action.payload;
      state.loading.filter((key) => key !== remove);
    },
    appMount: appMountFuc,
    getDrafts: getDraftFunc,
    newProUpdate: newProUpdateFunc,
    draftSave: draftSaveFunc,
    deleteDraft: deleteDraftFunc,
    newProDoc: newProDocFunc,
    updateSingleVariant: updateSingleVariantFunc,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategory.pending, pendingCategoryFetching);

    builder.addCase(fetchCategory.fulfilled, fulfilledCategoryFetching);

    builder.addCase(fetchCategory.rejected, rejectedCategoryFetching);

    builder.addCase(createProduct.pending, pendingCreateProduct);

    builder.addCase(createProduct.fulfilled, fulfilledCreateProduct);
  },
});

export default ProManageSlice.reducer;
export const {
  mainKeyChange,
  newAlert,
  removeAlert,
  removeLoading,
  newProUpdate,
  appMount,
  getDrafts,
  draftSave,
  deleteDraft,
  newProDoc,
  updateSingleVariant,
} = ProManageSlice.actions;
