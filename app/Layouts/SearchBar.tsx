import React, { FC, FormEvent, useRef } from "react";
import style from "./Header.module.css";
import Link from "next/link";

import {
  ISearch,
  ISearches,
  IToggleSuggestion,
} from "../../interfaces/userClientSide";
import { IMainKeyChange } from "../redux/UserSliceInterface";
import Suggestions from "./Suggestions";

interface IProps {
  submitHandler: (formData: FormData) => void;
  toggleSuggestion: IToggleSuggestion;
  inputChange: (e: FormEvent<HTMLInputElement>) => void;
  topLevelKey: (obj: IMainKeyChange) => void;
  loading: boolean;
  numOfSuggestion: number;
  numOfCart: number;
  searches: ISearches[];
}
const SearchBar: FC<IProps> = ({
  submitHandler,
  toggleSuggestion,
  inputChange,
  topLevelKey,
  loading,
  numOfSuggestion,
  numOfCart,
  searches,
}) => {
  const keyword = useRef<HTMLInputElement>(null);
  const searchFunc = (key: string) => {};
  const deleteSearchKeys = (key: string) => {};
  return (
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
                fill={loading ? "#FF0000" : "#FFFFFF"}
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
            onClick={() => {
              const current = keyword.current;
              if (current) current.value = "";
              // dispatch(clearSearch());
              // dispatch(activityKey({ name: "search", value: {} }));
              // dispatch(searchKeyChange(""));
            }}
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
        searches={searches}
      />
    </div>
  );
};

export default SearchBar;
