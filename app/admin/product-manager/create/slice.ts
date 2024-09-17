import districts from "@/static-data/districtsOfStatesOfIndia";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  ICreateData,
  IDraft,
  INewProUpdate,
  IUpdateSingleVariant,
} from "./interface";

import { IListOfLocation } from "@/interfaces/proManagerClientSide";
import categories from "@/static-data/categories";
export const newProDoc = {
  name: "",
  brand: "",
  tOfP: "",
  category: "",
  variants: [],
  imageSets: [],
  description: "",
  imgSetKey: "Colour",
  thumbnail: "",
  certificates: [],
  exInfo: [],
};
const appMountFuc = (state: ICreateData) => {
  const storageName = "createProduct";
  const draft = localStorage.getItem(storageName);
  let draftData: IDraft[] = [];
  if (draft) {
    draftData = JSON.parse(draft);
    if (Array.isArray(draftData)) {
      draftData = draftData;
    } else {
      localStorage.setItem(storageName, "[]");
      draftData = [];
    }
  } else {
    draftData = [];
    localStorage.setItem(storageName, "[]");
  }
  state.drafts = draftData;
  state.newData = newProDoc;
  state.incomplete = 1;
  state.opened = 1;

  if (!state.listOfLocation) {
    const listOfLocation: Array<IListOfLocation> = [];
    for (let state in districts) {
      listOfLocation.push({
        state,
        districts: districts[state],
      });
    }
    state.listOfLocation = listOfLocation;
  }
  if (!state.location)
    state.location = { state: "Chhattisgarh", district: "Raipur" };

  if (!state.fetchedCategories) state.fetchedCategories = [];
  state.loading = [];
  state.alerts = [];
  state.categories = categories;
};

const getDraftFunc = (
  state: ICreateData,
  action: PayloadAction<undefined | number>
) => {
  const drafts = state.drafts;
  const id = action.payload || drafts[0]?.id;

  const doc = drafts.find((draft) => draft.id == id);

  if (doc) {
    const { id, data } = doc;
    const { category } = data;
    const findCategories = state.fetchedCategories.some(
      (obj) => obj._id == category
    );
    if (!findCategories) state.loading.push("Category");
    state.openedDraft = id;
    state.newData = data;
  } else {
    state.openedDraft = null;
  }
  state.opened = 1;
};
const newProUpdateFunc = (
  state: any,
  action: PayloadAction<INewProUpdate[]>
) => {
  const keys = action.payload;
  for (let { name, value } of keys) state.newData[name] = value;
};

const draftSaveFunc = (
  state: ICreateData,
  action: PayloadAction<"createProduct">
) => {
  try {
    const storageName = action.payload;
    const currentDoc = state.newData;
    const openedDraft = state.openedDraft;

    const { name } = currentDoc;

    if (name.length < 10) {
      throw new Error("Please enter product name");
    }

    let draftData = localStorage.getItem(storageName) as string;
    let drafts = JSON.parse(draftData) as IDraft[];
    const today = new Date();
    const update = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    const hours = today.getHours();
    const minutes = today.getMinutes();

    const time = `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;

    const createData = { time, update, data: currentDoc } as IDraft;
    const findIndex = drafts.findIndex((data) => data.id == openedDraft);
    if (findIndex >= 0) {
      createData.id = drafts[findIndex].id;
      drafts[findIndex] = createData;
    } else {
      createData.id = Math.floor(Math.random() * 1000);
      drafts.unshift(createData);
    }

    const stringData = JSON.stringify(drafts);
    const encoder = new TextEncoder();
    const encodedString = encoder.encode(stringData);
    const sizeInMegabytes = +(encodedString.length / (1024 * 1024)).toFixed(2);

    if (sizeInMegabytes >= 4) {
      throw new Error("Delete any draft products first");
    }

    localStorage.setItem(storageName, stringData);
    state.drafts = drafts;
    state.openedDraft = createData.id;
    state.alerts.push({ type: "Success", text: "Saved In Draft" });
  } catch (err) {
    if (err instanceof Error) {
      state.alerts.push({ type: "Error", text: err.message, duration: "5s" });
    }
  }
};
const deleteDraftFunc = (state: ICreateData, action: PayloadAction<number>) => {
  const id = action.payload;
  if (state.openedDraft == id) {
    state.openedDraft = null;
  }
  const filtered = state.drafts.filter((data) => data.id !== id);
  state.drafts = filtered;
  localStorage.setItem("createProduct", JSON.stringify(filtered));
};
const newProDocFunc = (state: ICreateData) => {
  state.newData = newProDoc;
  state.incomplete = 1;
  state.opened = 1;
  state.openedDraft = null;
};
const updateSingleVariantFunc = (
  state: ICreateData,
  action: PayloadAction<IUpdateSingleVariant>
) => {
  const { _id, newData } = action.payload;
  const variants = state.newData.variants;
  state.newData.variants = variants.map((obj) => {
    if (obj._id === _id) {
      return newData;
    } else {
      return obj;
    }
  });
};

export {
  appMountFuc,
  getDraftFunc,
  newProUpdateFunc,
  draftSaveFunc,
  deleteDraftFunc,
  newProDocFunc,
  updateSingleVariantFunc,
};
