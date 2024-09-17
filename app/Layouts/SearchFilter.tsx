import React, { FC, memo } from "react";
import style from "./Header.module.css";
import { ISearchSort } from "@/interfaces/userClientSide";

interface IProps {
  keyName: boolean;
  searchSort: ISearchSort;
  changeSort: (newSort: ISearchSort) => void;
}
const SearchFilter: FC<IProps> = ({ keyName, searchSort, changeSort }) => {
  return (
    <div style={{ opacity: keyName ? "10" : "0" }}>
      <label className={style.filterLabel} htmlFor="sortBy">
        <svg
          fill="#000000"
          width="800px"
          height="800px"
          viewBox="0 0 24 24"
          id="filter-alt"
          data-name="Flat Color"
        >
          <path
            fill="#FFFFFF"
            id="primary"
            d="M19,22a1,1,0,0,1-1-1V14a1,1,0,0,1,2,0v7A1,1,0,0,1,19,22Zm-7,0a1,1,0,0,1-1-1V7a1,1,0,0,1,2,0V21A1,1,0,0,1,12,22ZM5,18a1,1,0,0,1-1-1V3A1,1,0,0,1,6,3V17A1,1,0,0,1,5,18Zm14-7a1,1,0,0,1-1-1V3a1,1,0,0,1,2,0v7A1,1,0,0,1,19,11Z"
          ></path>
          <path
            fill="#00FFFF"
            id="secondary"
            d="M22,12a3,3,0,1,1-3-3A3,3,0,0,1,22,12ZM12,2a3,3,0,1,0,3,3A3,3,0,0,0,12,2ZM5,16a3,3,0,1,0,3,3A3,3,0,0,0,5,16Z"
          ></path>
        </svg>
      </label>

      <label htmlFor="sortBy" className={style.sortBy}>
        <p>
          Sort by:{" "}
          <span>{searchSort == "Popular" ? "--Select--" : searchSort}</span>
        </p>

        <span onClick={() => changeSort("Low to High")}>
          Price:{"( Low to High )"}
        </span>
        <span onClick={() => changeSort("High to Low")}>
          Price:{"( High to Low )"}
        </span>
        <span onClick={() => changeSort("New Arrivals")}>New Arrivals</span>
        <span onClick={() => changeSort("Rating")}>Rating</span>
        <span onClick={() => changeSort("Discount")}>Discount</span>
        {searchSort !== "Popular" ? (
          <p onClick={() => changeSort("Popular")}>Clear Sort</p>
        ) : null}
      </label>
    </div>
  );
};

export default memo(SearchFilter);
