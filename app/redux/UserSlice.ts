import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { IAppMount, INewAlert } from "../Layouts/interface";

import {
  IMainKeyChange,
  ISearchBarInput,
  IVisitPage,
  IVisitState,
  StateType,
} from "./UserSliceInterface";

import {
  fetchKeyProduct,
  fetchRandom,
  getDistricts,
  suggestionsGet,
} from "./UserApiRequest";

import {
  ISearches,
  IFindSuggestion,
  IReduxUserData,
  ISuggestion,
  IAlert,
  IReduxUser,
  TPending,
} from "../../interfaces/userClientSide";

import { ILoginSuccess } from "../user/login/loginTypes";
import { ISearchProduct } from "@/interfaces/productServerSide";
import { suggestionLimit, suggestionPerReq } from "@/clientConfig";

const initialFindSuggestion = {
  preKey: "",
  loading: false,
  preCountData: undefined,
  changing: null,
};
const initialState: IReduxUser = {
  token: null,
  alerts: [],
  numOfCart: 0,
  proLoading: false,
  toggleSuggestion: "0px",
  canceled: [],
  delivered: [],
  newOrder: [],
  suggestions: [],
  storedSuggestions: [],
  districts: [],
  active: "other",
  home: { scrolled: 0 },
  findSuggestion: initialFindSuggestion,
  searches: [],
  storedProducts: [],
  products: [],
  searchSort: "Popular",
  data: {} as IReduxUserData,
  device: "Mobile",
  nOfNOrder: 0,
  loadings: [],
  searchKey: "",
  randomPage: 1,
  categories: [],
};

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    appMount: (state, action: PayloadAction<IAppMount>) => {
      const localData = (name: string): any => {
        try {
          let data = JSON.parse(localStorage.getItem(name) as string);
          return Array.isArray(data) ? data : [];
        } catch (err) {
          return [];
        }
      };
      const { initialToken, userData }: IAppMount = action.payload;
      const { cartPro, nOfNOrder, searches } = userData;
      state.data = userData;
      state.nOfNOrder = nOfNOrder || 0;
      state.numOfCart = cartPro?.length || 0;
      state.searches = (initialToken ? searches : localData("Searches")).map(
        ({ identity, ...obj }: ISearches) => {
          return {
            ...obj,
            identity: Number(identity) || identity,
            priority: 1,
            cached: [{ page: 1, sorted: "Popular" }],
          };
        }
      );

      state.token = initialToken;
      const { width, height } = window.screen;
      state.device =
        width <= 480 && height < 1000
          ? "Mobile"
          : width <= 900 && height < 2000
          ? "Tab"
          : "Desktop";
    },
    mainKeyChange: (
      state: StateType,
      action: PayloadAction<IMainKeyChange>
    ) => {
      const { name, value } = action.payload;
      state[name] = value;
    },

    newAlert: (state, action: PayloadAction<INewAlert>) => {
      const { info, completed } = action.payload;
      state.alerts.push(info);
      if (completed !== undefined) {
        state.loadings = state.loadings.filter(
          (pending) => pending !== completed
        );
      }
    },

    newLoading: (state, action: PayloadAction<TPending>) => {
      state.loadings.push(action.payload);
    },

    removeAlert: (state, action: PayloadAction<string>) => {
      const text = action.payload;
      const alerts = state.alerts.filter((alert) => alert.text !== text);
      state.alerts = alerts;
    },

    position: (state) => {
      state.toggleSuggestion = "0px";
      // const current = action.payload;
      // const oldP = state.home.scrolled;
      // if (oldP + 500 < current || oldP > current + 500) {
      //   state.home.scrolled = current;
      // }
    },

    searchBarInput: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const { loading, preKey, preCountData, changing } =
        state.findSuggestion as ISearchBarInput;
      const storedProducts = state.storedProducts;
      if (key) {
        const regex = new RegExp(key, "i");
        const suggestions = state.storedSuggestions;
        const tOfPS: ISuggestion[] = [];
        const names = suggestions.filter((obj) => {
          const { key, identity } = obj;
          if (regex.test(key)) {
            if (identity == "name") return obj;
            else tOfPS.push(obj);
          }
        });
        const newSuggestion = tOfPS.concat(names).slice(0, suggestionLimit);
        const products = storedProducts.filter((obj) => regex.test(obj.name));
        state.products = products.length ? products : [...storedProducts];

        const findNew = {
          preKey: key,
          preCountData: undefined,
          loading: true,
        } as IFindSuggestion;

        const keyLength = key.length;
        const preKeyLength = preKey.length;
        const randomPage = state.randomPage;
        if (randomPage) {
          if (
            !loading && key.includes(preKey) && preCountData === undefined
              ? true
              : preCountData === suggestionPerReq
          ) {
            findNew.changing = null;
            state.findSuggestion = findNew;
          } else if (
            !key.includes(preKey) &&
            changing !== false &&
            newSuggestion.length !== suggestionLimit
          ) {
            findNew.changing = true;
            state.findSuggestion = findNew;
          }
          if (changing === false && keyLength + 4 > preKeyLength) {
            state.findSuggestion.loading = false;
          }
        }
        state.suggestions = newSuggestion;
      } else {
        state.products = [...storedProducts];
        state.suggestions = [];
        state.findSuggestion = {
          preKey,
          loading: false,
          preCountData,
          changing: null,
        };
      }
    },

    checkChangingKey: (state) => {
      if (state.findSuggestion.loading) state.findSuggestion.changing = false;
    },

    loginSuccess: (state, action: PayloadAction<ILoginSuccess>) => {
      const { data, text, token } = action.payload;
      const { nOfNOrder, cartPro, searches } = data;
      state.token = token;
      state.data = data;
      state.alerts.push({ text, type: "Success", duration: "2s" });
      state.loadings = state.loadings.filter((pending) => pending !== "Login");
      state.nOfNOrder = nOfNOrder || 0;
      state.numOfCart = Array.isArray(cartPro) ? cartPro.length : 0;
      state.searches = searches;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDistricts.pending, (state) => {
      state.loadings = state.loadings.filter((pending) => pending !== "Login");
    });

    builder.addCase(getDistricts.fulfilled, (state, action) => {
      const { success, resAlert, resData, resState } = action.payload;
      if (success) {
        state.districts = resData;
      } else {
        state.alerts.push(resAlert as IAlert);
      }
      state.loadings = state.loadings.filter(
        (pending) => pending !== "District"
      );
    });
    builder.addCase(suggestionsGet.fulfilled, (state, action) => {
      const { success, searchKey, data = [] } = action.payload;
      const { loading } = state.findSuggestion;
      const newSuggestion = {
        preKey: searchKey,
        loading: false,
        changing: null,
        preCountData: data.length,
      };
      if (success) {
        const regex = new RegExp(searchKey, "i");
        const convert = (data: ISuggestion) => JSON.stringify(data);
        const stored = state.suggestions.map(convert);
        const setValue = new Set(stored.concat(data.map(convert)));
        const unique: ISuggestion[] = Array.from(setValue).map((obj) =>
          JSON.parse(obj)
        );
        const tOfPS: ISuggestion[] = [];
        const names = unique.filter((obj) => {
          const { key, identity } = obj;
          if (regex.test(key)) {
            if (identity == "name") return obj;
            else tOfPS.push(obj);
          }
        });
        if (newSuggestion.preCountData) {
          state.suggestions = unique;
        }
        if (loading) {
          state.storedSuggestions = tOfPS
            .concat(names)
            .slice(0, suggestionLimit);
        }
      }

      state.findSuggestion = newSuggestion;
    });
    builder.addCase(fetchRandom.pending, (state, action) => {
      state.proLoading = true;
    });

    builder.addCase(fetchRandom.fulfilled, (state, action) => {
      const { data, resPage, resSearches } = action.payload;
      // console.log(" data, resPage, resSearches", data, resPage, resSearches);

      const storedProducts = state.storedProducts;
      // console.log("storedProducts", storedProducts);
      state.randomPage = resPage || null;
      state.searches = resSearches;
      const unique: Array<ISearchProduct> = [];
      data?.forEach((obj) => {
        const _id = obj._id;
        if (!storedProducts.some((obj) => obj._id === _id)) {
          unique.push(obj);
        }
      });
      console.log("unique", unique);
      console.log("data", data);
      state.products.push(...unique);
      state.storedProducts.push(...unique);
      state.proLoading = false;
    });
    builder.addCase(fetchKeyProduct.pending, (state, action) => {
      state.proLoading = true;
    });
    builder.addCase(fetchKeyProduct.fulfilled, (state, action) => {
      const { success, status, message, key, isSearched, resPage, data } =
        action.payload;
      state.proLoading = false;
    });
  },
});

export default UserSlice.reducer;
export const {
  appMount,
  mainKeyChange,
  newAlert,
  removeAlert,
  position,
  searchBarInput,
  checkChangingKey,
  loginSuccess,
  newLoading,
} = UserSlice.actions;
