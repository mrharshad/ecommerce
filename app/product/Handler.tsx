"use client";
import React, { FC, useCallback, useEffect, useMemo } from "react";
import { ICartRequest, ICartResponse, IHandlerProps } from "./interface";

import { AppDispatch, IReduxStoreData } from "../redux/ReduxStore";
import { useDispatch, useSelector } from "react-redux";
import style from "./handler.module.css";

import SearchProduct from "../utils/SearchProduct";
import { ISearchProduct } from "@/interfaces/productServerSide";
import { useRouter } from "next/navigation";
import {
  dataKeyChange,
  mainKeyChange,
  newLoading,
  visitedProductPage,
} from "../redux/UserSlice";
import { IMainKeyChange } from "../redux/UserSliceInterface";
import { newPasswordToken } from "@/server/config/config";
const Handler: FC<IHandlerProps> = ({
  productId,
  categoryName,
  tOfPName,
  optionId,
  variantId,
}) => {
  const { token, data, storedProducts, loadings, alerts } = useSelector(
    (data: IReduxStoreData) => data.user
  );
  const { cartPro } = data;
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const addedToCart = cartPro.some(
    ({ _id, option, variant }) =>
      _id === productId && option === optionId && variant == variantId
  );

  const cartBtn = async () => {
    if (!token) {
      return router.push("/user/login");
    }

    dispatch(newLoading("Cart"));

    let request = await fetch(`/api/admin/user/cart`, {
      method: "PATCH",
      body: JSON.stringify({
        productId,
        variantId,
        optionId,
        token,
      } as ICartRequest),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = (await request.json()) as ICartResponse;

    const { success, message, newCart } = response;

    const keys: IMainKeyChange[] = [
      {
        name: "loadings",
        value: loadings.filter((pending) => pending !== "Cart"),
      },
      {
        name: "alerts",
        value: [
          ...alerts,
          { type: success ? "Success" : "Error", text: message },
        ],
      },
    ];

    if (success) {
      keys.push({ name: "numOfCart", value: newCart.length });
      dispatch(dataKeyChange([{ name: "cartPro", value: newCart }]));
    }
    dispatch(mainKeyChange(keys));
  };

  const { tOfProducts, catProducts } = useMemo(() => {
    const tOfProducts: ISearchProduct[] = [];
    const catProducts: ISearchProduct[] = [];
    for (let product of storedProducts) {
      const { _id, tOfP, category } = product;
      if (_id !== productId) {
        if (tOfP === tOfPName) tOfProducts.push(product);
        else if (category === categoryName) catProducts.push(product);
      }
    }

    return { tOfProducts, catProducts };
  }, [productId]);

  useEffect(() => {
    dispatch(
      visitedProductPage({
        _id: productId,
        category: categoryName,
        tOfP: tOfPName,
        time: Date.now(),
      })
    );
  }, [productId, dispatch]);

  useEffect(() => {
    const { addEventListener, removeEventListener } = window;
    const backBtnFunction = () => {
      router.push("/");
    };
    addEventListener("popstate", backBtnFunction);

    return () => {
      removeEventListener("popstate", backBtnFunction);
    };
  }, []);

  return (
    <>
      <div className={style.secondContainer}>
        <p className={style.free}>Free Delivery</p>
        <button
          onClick={cartBtn}
          id="addToCartBtn"
          style={{
            backgroundColor: addedToCart ? "lightgreen" : "revert-layer",
          }}
          className={style.addToCart}
          type="button"
        >
          Add to Cart
        </button>
      </div>
      <div id={style.tOfProducts} className={style.proContainer}>
        {tOfProducts.length > 0 && <p>Similar Products</p>}
        <div className={style.products}>
          {tOfProducts.map((product) => (
            <SearchProduct data={product} key={product._id} />
          ))}
        </div>
      </div>
      <div id={style.catProducts} className={style.proContainer}>
        {catProducts.length > 0 && <p>Related Product</p>}
        <div className={style.products}>
          {catProducts.map((product) => (
            <SearchProduct data={product} key={product._id} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Handler;
