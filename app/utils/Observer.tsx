"use client";
import React, { FC, useEffect, useState } from "react";

interface IProps {
  scrolledFetch: () => void;
}
const Observer: FC<IProps> = ({ scrolledFetch }) => {
  const [fetchNow, setFetchNow] = useState<number>(0);
  console.log("fetchNow", fetchNow);
  useEffect(() => {
    if (fetchNow) scrolledFetch();
  }, [fetchNow]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("run observer", fetchNow);
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
    return () => {
      observer.disconnect();
    };
  }, []);
  return <div id="productFetch"></div>;
};

export default Observer;
