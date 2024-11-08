"use client";
import { IReduxStoreData } from "@/app/redux/ReduxStore";
import Link from "next/link";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const PageClient = () => {
  const { numOfCart } = useSelector((data: IReduxStoreData) => data.user);
  useEffect(() => {
    const btn = document.querySelector<HTMLParagraphElement>(
      "#processToBuyBtn"
    ) as HTMLParagraphElement;
    const btnStyle = btn.style;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          btnStyle.position = "absolute";
          btnStyle.background = "none";
        } else {
          btnStyle.position = "fixed";
          btnStyle.background = "#8b8b8b52";
        }
      });
    });

    const loadingElement = document.querySelector(`#toggleProcessToBuy`);
    if (loadingElement) {
      observer.observe(loadingElement);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const element = document.getElementById("processToBuyBtn");
    if (element) {
      element.style.display = numOfCart ? "flex" : "none";
    }
  }, [numOfCart]);
  return (
    <>
      <p id="toggleProcessToBuy"></p>
      <div
        id="processToBuyBtn"
        style={{
          width: "100%",
          position: "absolute",
          bottom: "20px",
          display: "none",
        }}
      >
        <Link
          style={{
            backgroundColor: "#77889969",
            padding: "2px 20px",
            borderRadius: "5px",
            margin: "10px auto",
            borderRight: "1px solid aqua",
            borderLeft: "1px solid aqua",
            fontSize: "large",
            color: "white",
          }}
          href="cart/buy"
        >
          Process to buy
        </Link>
      </div>
    </>
  );
};

export default PageClient;
