import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { IAppMount, INewAlert } from "../Layouts/intereface";

import {
  IMainKeyChange,
  ISearchBarInput,
  StateType,
} from "./UserSliceInterface";
import { getDistricts, suggestionsGet } from "./UserApiRequest";

import {
  ISearches,
  IFindSuggestion,
  IReduxUserData,
  ISuggestions,
  IReduxUser,
  IAlert,
} from "../../interfaces/userClientSide";
import { ILoginSuccess } from "../user/login/loginTypes";

const initialState: IReduxUser = {
  alerts: [],
  search: { key: "", page: 1, identity: "tOfP" },
  numOfCart: 0,
  loading: false,
  toggleSuggestion: "0px",
  canceled: [],
  delivered: [],
  newOrder: [],
  suggestions: [],
  suggestion: [],
  districts: [],
  active: "other",
  home: { scrolled: 0 },
  productInfo: { scrolled: 0 },
  findSuggestion: {
    preKey: "",
    loading: false,
    preCountData: undefined,
    changing: null,
  },
  searches: [],
  dataEnd: false,
  allData: [],
  products: [],
  categories: [],
  page: 0,
  searchSort: "Popular",
  data: {} as IReduxUserData,
  device: "Mobile",
  nOfNOrder: 0,
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
      const { info, loading } = action.payload;
      state.alerts.push(info);
      if (loading !== undefined) state.loading = loading;
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts.filter((alert) => alert.text !== action.payload);
    },
    position: (state, action) => {
      const current = action.payload;
      const active = state.active;
      if (state.toggleSuggestion !== "0px") {
        state.toggleSuggestion = "0px";
      }
      if (active !== "other" && active !== "productInfo") {
        const oldP = state[active]?.scrolled;
        if (
          oldP + 500 < current ||
          oldP > current + 500
          //  &&
          // oldP - 1000 < current
        ) {
          state[active].scrolled = current;
        }
      }
    },
    searchBarInput: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      const { loading, preKey, preCountData, changing } =
        state.findSuggestion as ISearchBarInput;
      if (key) {
        const regex = new RegExp(key, "i");
        const suggestions = state.suggestions;
        const tOfPS: ISuggestions[] = [];
        const names = suggestions.filter((obj) => {
          const { key, identity } = obj;
          if (regex.test(key)) {
            if (identity == "name") return obj;
            else tOfPS.push(obj);
          }
        });
        const newSuggestion = tOfPS.concat(names).slice(0, 10);

        const allData = state.allData;
        state.products = allData.filter((obj) => regex.test(obj.name));

        const findNew = {
          preKey: key,
          preCountData: undefined,
          loading: true,
        } as IFindSuggestion;

        const keyLength = key.length;
        const preKeyLength = preKey.length;

        if (
          !loading && key.includes(preKey) && preCountData === undefined
            ? true
            : preCountData >= 10
        ) {
          findNew.changing = null;
          state.findSuggestion = findNew;
        } else if (
          !key.includes(preKey) &&
          changing !== false &&
          newSuggestion.length !== 10
        ) {
          findNew.changing = true;
          state.findSuggestion = findNew;
        }

        if (changing === false && keyLength + 4 > preKeyLength)
          state.findSuggestion.loading = false;
      } else {
        const searches = state.searches;
        const newSuggestion: ISuggestions[] = searches.flatMap((obj) => {
          const { byUser, identity, key } = obj;
          if (byUser) {
            return { key, identity };
          } else return [];
        });
        state.products = [];
        state.suggestion = newSuggestion;
        state.findSuggestion = {
          preKey: "",
          loading: false,
          preCountData: undefined,
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
      state.loading = false;
      state.nOfNOrder = nOfNOrder || 0;
      state.numOfCart = Array.isArray(cartPro) ? cartPro.length : 0;
      state.searches = searches;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDistricts.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(getDistricts.fulfilled, (state, action) => {
      const { success, resAlert, resData, resState } = action.payload;
      if (success) {
        state.districts = resData;
      } else {
        state.alerts.push(resAlert as IAlert);
      }
      state.loading = false;
    });
    builder.addCase(suggestionsGet.fulfilled, (state, action) => {
      const { success, searchKey, data = [] } = action.payload;
      const { loading, preKey } = state.findSuggestion;
      const newSuggestion = {
        preKey: searchKey,
        loading: false,
        changing: null,
        preCountData: data.length,
      };
      if (success) {
        const regex = new RegExp(searchKey, "i");
        const convert = (data: ISuggestions) => JSON.stringify(data);
        const stored = state.suggestions.map(convert);
        const setValue = new Set(stored.concat(data.map(convert)));
        const unique: ISuggestions[] = Array.from(setValue).map((obj) =>
          JSON.parse(obj)
        );
        // for (let { key, identity } of data) {
        //   if (!stored.some((obj) => obj.key === key))
        //     stored.push({ key, identity });
        // }
        const tOfPS: ISuggestions[] = [];
        const names = unique.filter((obj) => {
          const { key, identity } = obj;
          if (regex.test(key)) {
            if (identity == "name") return obj;
            else tOfPS.push(obj);
          }
        });
        if (newSuggestion.preCountData) state.suggestions = unique;
        if (loading) state.suggestion = tOfPS.concat(names).slice(0, 10);
      }

      state.findSuggestion = newSuggestion;
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
} = UserSlice.actions;
