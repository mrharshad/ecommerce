import { configureStore } from "@reduxjs/toolkit";
import proManager from "./ProManagerSlice";
import user from "./UserSlice";
import { IReduxUser } from "../interfaces/user";
import { IReduxProManager } from "../interfaces/proManager";

export interface IReduxStoreData {
  user: IReduxUser;
  proManager: IReduxProManager;
}
const Store = configureStore({
  reducer: { proManager, user },
  devTools: process.env.NODE_ENV === "development",
});
export type AppDispatch = typeof Store.dispatch;
export type RootState = ReturnType<typeof Store.getState>;
export default Store;
