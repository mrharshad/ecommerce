"use client";
import React, { FC, useCallback, useState, FormEvent, useEffect } from "react";
import style from "./Header.module.css";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { HeaderProps } from "./intereface";
import { IMainKeyChange } from "../redux/UserSliceInterface";
import Navbar from "./Navbar";
import SearchFilter from "./SearchFilter";
import SearchBar from "./SearchBar";

import {
  appMount,
  checkChangingKey,
  position,
  searchBarInput,
} from "../redux/UserSlice";
import { mainKeyChange } from "../redux/UserSlice";
import { suggestionsGet } from "../redux/UserApiRequest";
import { AppDispatch, IReduxStoreData } from "../redux/ReduxStore";
import UserAlerts from "./toastAndWait";
import { IFindSuggestion, ISearchSort } from "../../interfaces/userClientSide";

const Header: FC<HeaderProps> = ({ userData, initialToken }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    data,
    numOfCart,
    search,
    searchSort,
    toggleSuggestion,
    loading,
    newOrder,
    suggestions,
    alerts,
    page,
    token,
    products,
    findSuggestion,
    searches,
  } = useSelector((data: IReduxStoreData) => data.user);

  const [keyChanging, setKeyChanging] = useState<boolean>(false);
  const numOfSuggestion = suggestions.length;
  const keyName = search.key;
  const { fName } = data || {};
  const capitalizeWords = useCallback((str: string): string => {
    return str.replace(/\b\w/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  }, []);

  const changeSort = useCallback(
    (newSort: ISearchSort) => {
      if (searchSort !== newSort) {
        // searchFunc(undefined, newSort);
      }
    },
    [searchSort]
  );
  const replace = useCallback((path: string) => router.replace(path), [router]);

  const manageInputValue = useCallback(
    (value: string) => {
      router.push("/");
      const key = capitalizeWords(value);
      dispatch(searchBarInput(key));
    },
    [dispatch, capitalizeWords, router]
  );

  const inputChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value.trim();
      const length = value.length;
      if (length >= 4 || length === 0) manageInputValue(value);
    },
    [manageInputValue]
  );

  const topLevelKey = useCallback(
    (obj: IMainKeyChange): void => {
      dispatch(mainKeyChange(obj));
    },
    [dispatch]
  );

  const submitHandler = useCallback((formData: FormData) => {
    // e.preventDefault();
    const value = formData.get("searchBarInput") as string;

    // searchFunc();
  }, []);

  useEffect(() => {
    dispatch(appMount({ userData, initialToken }));
    let inputElement = document.getElementById("searchInput");

    inputElement?.addEventListener("focusout", function () {
      dispatch(mainKeyChange({ name: "toggleSuggestion", value: "0px" }));
    });
    const scrollHandler = () => {
      dispatch(position(window.scrollY));
    };
    addEventListener("scroll", scrollHandler);
  }, [dispatch, initialToken, userData]);
  useEffect(() => {
    const { preKey, loading, preCountData, changing } = findSuggestion;
    if (!loading) return;
    if (changing)
      setTimeout(() => {
        dispatch(checkChangingKey());
      }, 2000);
    else dispatch(suggestionsGet(preKey));
  }, [findSuggestion, dispatch]);

  return (
    <>
      <UserAlerts
        loading={loading}
        alerts={alerts}
        replace={replace}
        topLevelKey={topLevelKey}
      />
      <header className={style.header}>
        <Navbar fName={fName} numOfCart={numOfCart} />
        <SearchFilter
          keyName={keyName ? true : false}
          searchSort={searchSort}
          changeSort={changeSort}
        />

        <SearchBar
          submitHandler={submitHandler}
          toggleSuggestion={toggleSuggestion}
          inputChange={inputChange}
          topLevelKey={topLevelKey}
          loading={loading}
          numOfSuggestion={numOfSuggestion}
          numOfCart={numOfCart}
          searches={searches}
        />
      </header>
    </>
  );
};

export default Header;
