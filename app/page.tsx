"use client";
import { useEffect, useRef, useState } from "react";
import style from "./page.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, IReduxStoreData } from "./redux/ReduxStore";
import { checkChangingKey, mainKeyChange } from "./redux/UserSlice";
import {
  fetchKeyProduct,
  fetchRandom,
  suggestionsGet,
} from "./redux/UserApiRequest";
import { useRouter } from "next/navigation";
import SearchProduct from "./utils/SearchProduct";

import Observer from "./Observer";
import { ISearches } from "@/app/interfaces/user";
import { IMainKeyChange } from "./redux/UserSliceInterface";
import { ISearchProduct } from "@/server/interfaces/product";
import SearchProductSkeletons from "./utils/SearchProductSkeletons";
import Image from "next/image";
import notFound from "@/public/empty search result.png";
export default function Home() {
  const dispatch = useDispatch<AppDispatch>();

  const router = useRouter();
  const {
    searchKey,
    searchSort,
    proLoading,
    products,
    findSuggestion,
    searches,
    storedSuggestions,
    randomPage,
    storedProducts,
  } = useSelector((data: IReduxStoreData) => data.user);

  const numOfProducts = products.length;

  const fetchRandomProducts = () => {
    dispatch(
      fetchRandom({
        page: randomPage,
        searches,
      })
    );
  };

  const keyProductFetch = () => {
    if (!searchKey && numOfProducts === storedProducts.length) return;

    const lowerCase = searchKey.toLowerCase();
    const findSearch = searchKey
      ? searches.find((obj) => obj.key == searchKey)
      : ({} as ISearches);

    let { key, cached, identity = "name" } = findSearch || ({} as ISearches);

    let page: null | number = 1;
    if (key) {
      const nullCheck = cached.some((obj) => obj.page === null);
      if (nullCheck) {
        page = null;
      } else {
        const fetchedPage = cached.find(
          (obj) => obj.sorted === searchSort
        )?.page;
        if (fetchedPage !== undefined) {
          page = fetchedPage;
        }
      }
    } else {
      const findSuggestion = storedSuggestions.find(
        (obj) => obj.key.toLowerCase() === lowerCase
      );
      if (findSuggestion) {
        key = findSuggestion.key;
        identity = findSuggestion.identity;
      }
    }
    if (Number(identity)) {
      return router.push(
        `/product/?_id=${identity}&k=${key.replace(/ /g, "-")}`
      );
    }

    key = key || searchKey;

    let data: Array<ISearchProduct> = [];
    const regex = new RegExp(lowerCase, "i");
    let filterFunction;
    switch (identity) {
      case "tOfP":
        filterFunction = (obj: ISearchProduct) => obj.tOfP === key;
        break;
      case "category":
        filterFunction = (obj: ISearchProduct) => obj.category === key;
        break;
      default:
        filterFunction = (obj: ISearchProduct) => regex.test(obj.name);
    }
    data = storedProducts.filter(filterFunction);
    let sortingFunction;
    switch (searchSort) {
      case "Discount":
        sortingFunction = (a: ISearchProduct, b: ISearchProduct) =>
          b.discount - a.discount;
        break;
      case "High to Low":
        sortingFunction = (a: ISearchProduct, b: ISearchProduct) =>
          b.price - a.price;
        break;
      case "Low to High":
        sortingFunction = (a: ISearchProduct, b: ISearchProduct) =>
          a.price - b.price;
        break;
      case "Rating":
        sortingFunction = (a: ISearchProduct, b: ISearchProduct) =>
          b.price - a.price;
        break;
      case "New Arrivals":
        sortingFunction = (a: ISearchProduct, b: ISearchProduct) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      default:
        sortingFunction = (a: ISearchProduct, b: ISearchProduct) =>
          b.popular || 0 - (a.popular || 0);
    }

    data = data.sort(sortingFunction);
    const keys: Array<IMainKeyChange> = [{ name: "products", value: data }];

    if (page && key && randomPage) {
      keys.push({ name: "proLoading", value: true });
      dispatch(
        fetchKeyProduct({
          key,
          identity,
          page,
          searchSort,
        })
      );
    }
    dispatch(mainKeyChange(keys));
  };

  const scrolledFetch = () => {
    if (
      proLoading ||
      !randomPage ||
      (products.length !== storedProducts.length && !searchKey)
    )
      return;
    if (searchKey) {
      keyProductFetch();
    } else {
      fetchRandomProducts();
    }
  };

  useEffect(() => {
    const { preKey, loading, changing } = findSuggestion;
    if (!loading) return;
    if (changing)
      setTimeout(() => {
        dispatch(checkChangingKey());
      }, 2000);
    else {
      dispatch(suggestionsGet(preKey));
    }
  }, [findSuggestion, dispatch]);

  return (
    <main id="mainContent" className={style.container}>
      <section className={style.products}>
        {products.map((data) => (
          <SearchProduct data={data} key={data._id} />
        ))}
        {proLoading && <SearchProductSkeletons numOfSkeleton={28} />}
      </section>
      {!numOfProducts && searchKey && !proLoading ? (
        <div className={style.notFound}>
          <Image src={notFound} alt="Product Not-Found" />
        </div>
      ) : null}
      <Observer
        keyProductFetch={keyProductFetch}
        scrolledFetch={scrolledFetch}
        searchSort={searchSort}
        searchKey={searchKey}
        fetchRandomProducts={fetchRandomProducts}
        numOfProducts={numOfProducts}
      />
    </main>
  );
}
