"use client";
import { useCallback, useEffect, useState } from "react";
import style from "./page.module.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, IReduxStoreData } from "./redux/ReduxStore";
import { checkChangingKey, position } from "./redux/UserSlice";
import {
  fetchKeyProduct,
  fetchRandom,
  suggestionsGet,
} from "./redux/UserApiRequest";
import { useRouter } from "next/navigation";
import SearchProduct from "./utils/SearchProduct";
import dynamic from "next/dynamic";
import Observer from "./utils/Observer";
import { ISearches } from "@/interfaces/userClientSide";

export default function Home() {
  console.log("Home Page re-render");
  const dispatch = useDispatch<AppDispatch>();
  const skeleton = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28,
  ];
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
    home,
    randomPage,
    storedProducts,
  } = useSelector((data: IReduxStoreData) => data.user);
  console.log("random page", randomPage);
  console.log("products", products.length);
  const numOfProducts = products.length;
  // console.log("findSuggestion", findSuggestion);
  // console.log("suggestions", suggestions);
  // console.log("storedSuggestions", storedSuggestions);
  const fetchRandomProducts = () => {
    dispatch(
      fetchRandom({
        page: randomPage,
        searches,
      })
    );
  };
  const keyProductFetch = () => {
    const lowerCase = searchKey.toLowerCase();
    const findSearch =
      searches.find((obj) => obj.key.toLowerCase() == lowerCase) ||
      ({} as ISearches);
    let isSearched = false;
    let { key, cached, identity = "name" } = findSearch;
    let page: undefined | number = undefined;
    if (key) {
      const fetchedPage = cached.find((obj) => obj.sorted === searchSort)?.page;
      isSearched = true;
      if (fetchedPage === null) return;
      page = fetchedPage;
    } else {
      const findSuggestion = storedSuggestions.find(
        (obj) => obj.key.toLowerCase() === lowerCase
      );
      if (findSuggestion) {
        key = findSuggestion.key;
        identity = findSuggestion.identity;
      }
    }
    fetchKeyProduct({
      isSearched,
      key: key || lowerCase,
      identity,
      page: page || 1,
    });
  };
  const scrolledFetch = () => {
    console.log("scrolledFetch", products.length);
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

  useEffect(() => {
    const { scrollTo, addEventListener } = window;
    // scrollTo({

    //   top: scrolled,
    //   left: 0,
    //   behavior: "smooth",
    // });

    const scrollHandler = () => {
      console.log("scrolled");
      dispatch(position());
    };
    addEventListener("scroll", scrollHandler);

    if (!products.length) {
      fetchRandomProducts();
    }
    // return () => {
    //   removeEventListener("scroll", scrollHandler);
    // };
  }, []);

  return (
    <main id="mainContent" className={style.container}>
      <section className={style.products}>
        {products.map((data) => (
          <SearchProduct data={data} key={data._id} />
        ))}
        {proLoading &&
          skeleton.map((id) => (
            <div key={id} className={style.product}>
              <div className={style.ratingReviews}></div>
              <p className={style.name}></p>
              <div className={style.imgCover}></div>
              <div className={style.options}>
                <p></p>
                <p></p>
                <p></p>
              </div>
            </div>
          ))}
        {!numOfProducts && searchKey ? (
          <p className={style.notFound}>Product Not Found</p>
        ) : null}
      </section>
      <Observer scrolledFetch={scrolledFetch} />
    </main>
  );
}
