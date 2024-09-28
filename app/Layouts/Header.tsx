"use client";
import React, { FC, useCallback, FormEvent, useEffect, useRef } from "react";
import style from "./Header.module.css";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { HeaderProps } from "./interface";
import { IMainKeyChange } from "../redux/UserSliceInterface";
import Navbar from "./Navbar";
import SearchFilter from "./SearchFilter";

import {
  appMount,
  position,
  removeAlert,
  searchBarInput,
} from "../redux/UserSlice";
import { mainKeyChange } from "../redux/UserSlice";

import { AppDispatch, IReduxStoreData } from "../redux/ReduxStore";
import UserAlerts from "./UserAlert";
import {
  ISearchesIdentity,
  ISearchSort,
} from "../../interfaces/userClientSide";
import Suggestions from "./Suggestions";
import Link from "next/link";

const Header: FC<HeaderProps> = ({ userData, initialToken }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    data,
    numOfCart,
    searchKey,
    searchSort,
    toggleSuggestion,
    proLoading,
    newOrder,
    suggestions,
    alerts,
    token,
    products,
    findSuggestion,
    searches,
    storedSuggestions,
    loadings,
  } = useSelector((data: IReduxStoreData) => data.user);

  const numOfSuggestion = suggestions.length;

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

  const inputChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value.trim();
      const key = capitalizeWords(value);
      const length = key.length;
      if (length >= 4 || length === 0) {
        router.push("/");
        dispatch(searchBarInput(key));
      }
    },
    [capitalizeWords, dispatch, router]
  );

  const topLevelKey = useCallback(
    (obj: IMainKeyChange): void => {
      dispatch(mainKeyChange(obj));
    },
    [dispatch]
  );

  const submitHandler = useCallback((formData: FormData) => {
    const value = formData.get("searchBarInput") as string;

    // searchFunc();
  }, []);

  useEffect(() => {
    dispatch(appMount({ userData, initialToken }));
    let inputElement = document.getElementById("searchInput");

    inputElement?.addEventListener("focusout", function () {
      dispatch(mainKeyChange({ name: "toggleSuggestion", value: "0px" }));
    });
  }, [dispatch, initialToken, userData]);

  const keyword = useRef<HTMLInputElement>(null);
  const searchFunc = useCallback(
    (identity: ISearchesIdentity, key: string) => {
      if (typeof identity === "number") {
        router.push(`/product/?_id=${identity}&k=${key.replace(/ /g, "-")}`);
      } else {
        dispatch(mainKeyChange({ name: "searchKey", value: key }));
      }
    },
    [dispatch]
  );
  const deleteSearchKeys = useCallback((key: string) => {}, []);
  const removeAlertFunc = useCallback(
    (text: string) => {
      dispatch(removeAlert(text));
      const login = ["token is invalid", "token is expired"];
      if (login.includes(text)) {
        router.push("/user/login");
      } else if (text === "reload") {
        window.location.reload();
      }
    },
    [dispatch, router]
  );
  console.log("toggleSuggestion", toggleSuggestion);
  return (
    <>
      <UserAlerts
        loading={loadings}
        alerts={alerts}
        removeAlert={removeAlertFunc}
      />
      <header className={style.header}>
        <Navbar fName={fName} numOfCart={numOfCart} />
        <SearchFilter
          keyName={searchKey ? true : false}
          searchSort={searchSort}
          changeSort={changeSort}
        />

        <div className={style.searchBar}>
          <form className={style.form} id="form" action={submitHandler}>
            <input
              style={
                toggleSuggestion == "1000px"
                  ? {
                      border: "1px solid skyblue",
                    }
                  : {}
              }
              name="searchBarInput"
              onChange={inputChange}
              className={style.input}
              id="searchInput"
              type="text"
              placeholder="Search products..."
              autoComplete="off"
              ref={keyword}
              onClick={() => {
                if (toggleSuggestion === "0px") {
                  topLevelKey({ name: "toggleSuggestion", value: "1000px" });
                }
              }}
            />
            <div>
              <button className={style.button} type="submit">
                <svg viewBox="0 0 24 24">
                  <path
                    fill={
                      proLoading || findSuggestion.loading
                        ? "#FF0000"
                        : "#FFFFFF"
                    }
                    d="M0 0h24v24H0V0z"
                  ></path>
                  <path
                    d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    fill="#000000"
                  ></path>
                </svg>
              </button>

              <svg
                style={{ opacity: numOfSuggestion ? "10" : "0px" }}
                className={style.searchCancel}
                viewBox="0 0 24 24"
                id="Close"
              >
                <path
                  d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            </div>
            <Link className={style.cart} href="/admin/user/product/cart">
              <svg fill="#FFFFFF" viewBox="0 0 36 36">
                <circle fill="#FF0000" cx="13.5" cy="29.5" r="2.5"></circle>
                <circle fill="#FF0000" cx="26.5" cy="29.5" r="2.5"></circle>
                <path d="M33.1,6.39A1,1,0,0,0,32.31,6H9.21L8.76,4.57a1,1,0,0,0-.66-.65L4,2.66a1,1,0,1,0-.59,1.92L7,5.68l4.58,14.47L9.95,21.49l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.12a1,1,0,0,0,1-.76l3.2-13A1,1,0,0,0,33.1,6.39Z"></path>
              </svg>
              <span>{numOfCart}</span>
            </Link>
          </form>
          <Suggestions
            searchFunc={searchFunc}
            deleteSearchKeys={deleteSearchKeys}
            toggleSuggestion={toggleSuggestion}
            suggestions={suggestions}
            searches={searches}
          />
        </div>
      </header>
    </>
  );
};

export default Header;
