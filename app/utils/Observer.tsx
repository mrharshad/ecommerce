"use client";
import { TSearchSort } from "@/interfaces/userClientSide";
import React, { FC, useEffect, useState } from "react";

interface IProps {
  scrolledFetch: () => void;
  searchKey: string;
  searchSort: TSearchSort;
  keyProductFetch: () => void;
  fetchRandomProducts: () => void;
  numOfProducts: number;
}
const Observer: FC<IProps> = ({
  scrolledFetch,
  keyProductFetch,
  searchKey,
  searchSort,
  fetchRandomProducts,
  numOfProducts,
}) => {
  const [fetchNow, setFetchNow] = useState<number>(0);
  const [fetchRandom, setRandom] = useState<boolean>(false);
  useEffect(() => {
    if (!fetchNow && !searchKey) return;
    keyProductFetch();
  }, [searchKey, searchSort]);

  useEffect(() => {
    if (fetchNow) scrolledFetch();
  }, [fetchNow]);

  useEffect(() => {
    if (fetchRandom) fetchRandomProducts();
  }, [fetchRandom]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFetchNow(Math.floor(Math.random() * 1000));
          }
        });
      },
      {
        // root: document.querySelector("nav"),
        // rootMargin: "100px",
        // threshold: 0,
      }
    );

    const loadingElement = document.querySelector(`#productFetch`);
    if (loadingElement) {
      observer.observe(loadingElement);
    }
    if (!numOfProducts) {
      setRandom(true);
    }
    return () => {
      observer.disconnect();
    };
  }, []);
  return <div id="productFetch"></div>;
};

export default Observer;
