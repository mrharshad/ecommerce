import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { IAppMount, INewAlert } from "../Layouts/interface";

import {
  IAuthenticated,
  IDataKeyChange,
  IMainKeyChange,
  ISearchBarInput,
  StateType,
} from "./UserSliceInterface";

import {
  deleteSearch,
  fetchKeyProduct,
  fetchRandom,
  getDistricts,
  setNewSearches,
  suggestionsGet,
} from "./UserApiRequest";

import {
  ISearches,
  IFindSuggestion,
  ISuggestion,
  IAlert,
  IReduxUser,
  TPending,
  TDevice,
  IReduxUserData,
  IViewedPro,
} from "../../interfaces/userClientSide";

import { ISearchProduct } from "@/interfaces/productServerSide";
import {
  searchesLocal,
  suggestionLimit,
  suggestionPerReq,
} from "@/clientConfig";
import { IAuthorizedUser, ICartPro } from "@/interfaces/userServerSide";

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
  findSuggestion: initialFindSuggestion,
  searches: [],
  viewedPro: [],
  storedProducts: [],
  products: [],
  searchSort: "Popular",
  data: {} as IReduxUserData,
  device: "" as TDevice,
  nOfNOrder: 0,
  loadings: [],
  searchKey: "",
  randomPage: 1,
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
      const { searches, ...data } = userData;
      const { nOfNOrder, cartPro } = data;
      state.data = initialToken
        ? data
        : ({
            cartPro: [] as ICartPro[],
            location: [
              {
                _id: new Date(),
                district: "",
                state: "",
                pinCode: 4920,
                area: "",
                address: "",
              },
            ],
          } as IReduxUserData);
      state.nOfNOrder = nOfNOrder || 0;
      state.numOfCart = cartPro?.length || 0;
      state.searches = (initialToken ? searches : localData(searchesLocal)).map(
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
      action: PayloadAction<IMainKeyChange[]>
    ) => {
      const keys = action.payload;
      for (let { name, value } of keys) state[name] = value;
    },

    dataKeyChange: (
      state: StateType,
      action: PayloadAction<IDataKeyChange[]>
    ) => {
      const keys = action.payload;
      for (let { name, value } of keys) state.data[name] = value;
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

    hideSuggestion: (state) => {
      state.toggleSuggestion = "0px";
    },

    searchBarInput: (state, action: PayloadAction<string>) => {
      const {
        findSuggestion,
        storedProducts,
        randomPage,
        storedSuggestions,
        searches,
      } = state;
      const key = action.payload;
      const { loading, preKey, preCountData, changing } =
        findSuggestion as ISearchBarInput;

      if (key) {
        const regex = new RegExp(key, "i");
        const searchHistory = searches.flatMap((obj) => {
          const { key, identity } = obj;
          if (regex.test(key)) {
            return { key, identity };
          } else return [];
        });
        const tOfPS: ISuggestion[] = [];
        const others = storedSuggestions.filter((obj) => {
          const { key, identity } = obj;
          if (searchHistory.some((history) => history.key === key)) return;
          if (regex.test(key)) {
            if (identity == "tOfP") tOfPS.push(obj);
            else return obj;
          }
        });

        const newSuggestion = [...searchHistory, ...tOfPS, ...others];
        const products = storedProducts.filter((obj) => regex.test(obj.name));
        state.products = products.length ? products : [...storedProducts];

        const findNew = {
          preKey: key,
          preCountData: undefined,
          loading: true,
        } as IFindSuggestion;

        if (randomPage) {
          if (
            !loading &&
            key.includes(preKey) &&
            key !== preKey &&
            (preCountData === undefined
              ? true
              : preCountData === suggestionPerReq)
          ) {
            findNew.changing = null;
            state.findSuggestion = findNew;
          } else if (
            !key.includes(preKey) &&
            changing !== false &&
            newSuggestion.length < suggestionLimit
          ) {
            findNew.changing = true;
            state.findSuggestion = findNew;
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
      state.findSuggestion.changing = false;
    },

    authenticated: (state, action: PayloadAction<IAuthenticated>) => {
      const { data, text, token, completed } = action.payload;
      const { searches, nOfNOrder, cartPro, ...otherData } = data;
      state.token = token;
      state.data = { ...otherData, cartPro };
      state.alerts.push({ text, type: "Success", duration: "4s" });
      state.loadings = state.loadings.filter(
        (pending) => pending !== completed
      );
      state.nOfNOrder = nOfNOrder || 0;
      state.numOfCart = Array.isArray(cartPro) ? cartPro.length : 0;
      state.searches = searches;
    },
    visitedProductPage: (state, action: PayloadAction<IViewedPro>) => {
      state.viewedPro.unshift(action.payload);
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
      const { success, searchKey, data } = action.payload;

      const { findSuggestion, storedSuggestions, suggestions } = state;
      const { loading } = findSuggestion;
      const newSuggestion = {
        preKey: searchKey,
        loading: false,
        changing: null,
        preCountData: data.length,
      };
      if (success) {
        if (newSuggestion.preCountData) {
          const keys = suggestions.map((obj) => obj.key);
          state.suggestions = [
            ...data.filter((obj) => !keys.includes(obj.key)),
            ...suggestions,
          ];
        }
        const unique = data.flatMap((newSuggestion) => {
          const { key } = newSuggestion;
          if (storedSuggestions.some((obj) => obj.key === key)) {
            return [];
          } else {
            return newSuggestion;
          }
        });
        state.storedSuggestions.push(...unique);
      }

      state.findSuggestion = newSuggestion;
    });
    builder.addCase(fetchRandom.pending, (state) => {
      state.proLoading = true;
    });

    builder.addCase(fetchRandom.fulfilled, (state, action) => {
      const { success, message, data, resPage, resSearches } = action.payload;
      state.proLoading = false;
      const { storedProducts, searchKey } = state;
      if (success) {
        state.randomPage = resPage;
        state.searches = resSearches;

        const unique: Array<ISearchProduct> = [];
        data?.forEach((obj) => {
          const _id = obj._id;
          if (!storedProducts.some((obj) => obj._id === _id)) {
            unique.push(obj);
          }
        });

        if (!searchKey) {
          state.products.push(...unique);
        }
        state.storedProducts.push(...unique);
      } else {
        state.alerts.push({ text: message, type: "Error", duration: "5s" });
      }
    });

    builder.addCase(fetchKeyProduct.fulfilled, (state, action) => {
      const {
        success,
        message,
        key: resKey,
        resPage,
        identity,
        data,
      } = action.payload;
      state.proLoading = false;

      if (success) {
        const { searches, storedProducts, searchSort } = state;
        const unique: Array<ISearchProduct> = [];
        data?.forEach((obj) => {
          const _id = obj._id;
          if (!storedProducts.some((obj) => obj._id === _id)) {
            unique.push(obj);
          }
        });
        state.products.push(...unique);
        state.storedProducts.push(...unique);
        let searchDoc = {} as ISearches;
        const findSearch = searches.find((obj) => obj.key === resKey);
        if (findSearch) {
          const { priority, cached } = findSearch;
          searchDoc = {
            ...findSearch,
            priority: priority + 1,
            cached: [
              ...cached.filter((info) => info.sorted !== searchSort),
              { page: resPage, sorted: searchSort },
            ],
          };
        } else {
          searchDoc = {
            key: resKey,
            byUser: true,
            identity,
            priority: 1,
            cached: [{ page: resPage, sorted: searchSort }],
          };
        }
        state.searches = [
          searchDoc,
          ...searches.filter((obj) => obj.key !== resKey),
        ];
      } else {
        state.alerts.push({ text: message, type: "Error", duration: "5s" });
      }
    });

    builder.addCase(setNewSearches.fulfilled, (state, action) => {
      const { message, success } = action.payload;
      if (!success) {
        state.alerts.push({ text: message, type: "Error", duration: "4s" });
      }
      if (message === "Search history is invalid") {
        state.searches = [];
      }
    });

    builder.addCase(deleteSearch.fulfilled, (state, action) => {
      const { message, success, removedSearch } = action.payload;
      console.log(
        "message, success, removedSearch ",
        message,
        success,
        removedSearch
      );
      if (!success) {
        state.alerts.push(
          { text: message, type: "Error", duration: "5s" },
          { text: `could not delete ${removedSearch.key} key`, type: "Error" }
        );
        state.searches.unshift(removedSearch);
      }
    });
  },
});

export default UserSlice.reducer;
export const {
  appMount,
  mainKeyChange,
  newAlert,
  removeAlert,
  hideSuggestion,
  searchBarInput,
  checkChangingKey,
  authenticated,
  newLoading,
  dataKeyChange,
  visitedProductPage,
} = UserSlice.actions;
