import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { IAppMount, INewAlert } from "../Layouts/interface";

import {
  IAuthenticated,
  ICartQtyChange,
  IDataKeyChange,
  IMainKeyChange,
  INewAutoSearch,
  IRemoveCart,
  ISearchBarInput,
  StateType,
} from "./UserSliceInterface";

import {
  deleteSearch,
  fetchKeyProduct,
  fetchRandom,
  getDistricts,
  getUserContacts,
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
  ICartPro,
} from "../interfaces/user";

import { ISearchProduct } from "@/server/interfaces/product";
import {
  viewedProLocal,
  suggestions as suggestionsConfig,
  searches as searchesConfig,
} from "@/exConfig";
import { IGetUserContactsRes, INewOrderRes } from "./UserApiRequestInterface";
import { INewOrder } from "@/server/interfaces/newOrder";
const { perRequest, showClient } = suggestionsConfig;
const { storeName } = searchesConfig;
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
  suggestions: [],
  storedSuggestions: [],
  districts: [],
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
  urlKey: { orders: 0 },
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
      const { cartPro } = data;
      state.data = initialToken
        ? (data as IReduxUserData)
        : ({
            cartPro: [] as ICartPro[],
            location: [
              {
                _id: new Date().toISOString() as any,
                district: "",
                state: "",
                pinCode: 4920,
                area: "",
                address: "",
              },
            ],
          } as IReduxUserData);

      state.numOfCart = cartPro?.length || 0;
      state.searches = (initialToken ? searches : localData(storeName)).map(
        ({ identity, ...obj }: ISearches) => {
          return {
            ...obj,
            identity: Number(identity) || identity,
            priority: 1,
            cached: [{ page: 1, sorted: "Popular" }],
          };
        }
      );
      state.viewedPro = localData(viewedProLocal);
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
            (preCountData === undefined ? true : preCountData === perRequest)
          ) {
            findNew.changing = null;
            state.findSuggestion = findNew;
          } else if (
            !key.includes(preKey) &&
            changing !== false &&
            newSuggestion.length < showClient
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
      const { searches, cartPro, ...otherData } = data;
      state.token = token;
      state.data = { ...otherData, cartPro } as IReduxUserData;
      state.alerts.push({ text, type: "Success", duration: "4s" });
      state.loadings = state.loadings.filter(
        (pending) => pending !== completed
      );
      state.numOfCart = Array.isArray(cartPro) ? cartPro.length : 0;
      state.searches = searches;
    },
    visitedProductPage: (state, action: PayloadAction<IViewedPro>) => {
      state.viewedPro.unshift(action.payload);
    },
    newAutoSearch: (state, action: PayloadAction<INewAutoSearch>) => {
      const { key: newKey, identity: newIdentity } = action.payload;

      const searches = state.searches;
      const findSearchIndex = searches.findIndex(
        ({ key, identity }) => key === newKey && identity === newIdentity
      );
      if (findSearchIndex >= 0) {
        state.searches = searches.map((obj, index) => {
          if (index === findSearchIndex) {
            return { ...obj, priority: obj.priority + 1 };
          } else return obj;
        });
      } else {
        state.searches.push({
          key: newKey,
          priority: 1,
          byUser: false,
          identity: newIdentity,
          cached: [],
        });
      }
    },
    cartQtyChange: (state, action: PayloadAction<ICartQtyChange>) => {
      const { newQty, newDiscount, cartIdentity } = action.payload;
      const { _id, added } = cartIdentity;
      state.data.cartPro = state.data.cartPro.map((obj) => {
        if (obj._id === _id && obj.added === added) {
          return { ...obj, quantity: newQty, discount: newDiscount };
        } else return obj;
      });
    },
    removeCart: (state, action: PayloadAction<IRemoveCart>) => {
      const { cartInfo, response } = action.payload;
      const { status, success, message } = response;
      state.loadings = state.loadings.filter((pending) => pending !== "Cart");
      state.alerts.push({
        text: message,
        type: status === 201 ? "Message" : success ? "Success" : "Error",
      });
      if (success) {
        const { _id: cartId, added: cartAdded } = cartInfo;
        state.data.cartPro = state.data.cartPro.filter(
          ({ _id, added }) => _id !== cartId && added !== cartAdded
        );
        state.numOfCart -= 1;
      }
    },
    newOrder: (state, action: PayloadAction<INewOrderRes>) => {
      const {
        success,
        message,
        newClientCartPro = [],
        newClientSearches = [],
      } = action.payload;

      state.loadings = state.loadings.filter((key) => key !== "Order");
      state.alerts.push({ text: message, type: success ? "Success" : "Error" });
      if (success) {
        state.data.cartPro = newClientCartPro;
        state.numOfCart = newClientCartPro.length;
        state.data.mobileNo = undefined;
        state.data.email = undefined;
        state.searches = newClientSearches;
      }
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
      if (!success) {
        state.alerts.push(
          { text: message, type: "Error", duration: "5s" },
          { text: `could not delete ${removedSearch.key} key`, type: "Error" }
        );
        state.searches.unshift(removedSearch);
      }
    });
    builder.addCase(getUserContacts.pending, (state, action) => {
      state.loadings.push("Contact");
    });

    builder.addCase(
      getUserContacts.fulfilled,
      (state, action: PayloadAction<IGetUserContactsRes>) => {
        const { success, message, data } = action.payload;
        if (success) {
          state.data.email = data?.email;
          state.data.mobileNo = data?.mobileNo;
        } else {
          state.alerts.push({ text: message, type: "Error" });
        }
        state.loadings = state.loadings.filter((key) => key !== "Contact");
      }
    );
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
  newAutoSearch,
  cartQtyChange,
  removeCart,
  newOrder,
} = UserSlice.actions;
