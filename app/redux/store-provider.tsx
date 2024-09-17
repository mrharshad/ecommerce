"use client";
import React, { FunctionComponent, ReactNode } from "react";
import { Provider } from "react-redux";
import Store from "./ReduxStore";
interface IStoreProviderProps {
  children: ReactNode;
}
const StoreProvider: FunctionComponent<IStoreProviderProps> = ({
  children,
}) => {
  return <Provider store={Store}>{children}</Provider>;
};

export default StoreProvider;
