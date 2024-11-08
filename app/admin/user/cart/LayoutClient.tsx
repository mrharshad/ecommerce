"use client";
import emptyCart from "@/public/empty cart.png";
import { AppDispatch, IReduxStoreData } from "@/app/redux/ReduxStore";
import {
  IFetchCartProductsRes,
  IRemoveCartsReq,
  IRemoveCartsRes,
} from "@/app/redux/UserApiRequestInterface";
import {
  cartQtyChange,
  dataKeyChange,
  mainKeyChange,
  newAlert,
  newLoading,
  removeCart,
} from "@/app/redux/UserSlice";
import { deliveryTime, indiaOffset, msADay } from "@/exConfig";

import { ICartPro, IStockInfoCartPro } from "@/app/interfaces/user";
import { ICartPro as ICartProServer } from "@/server/interfaces/user";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ICartIdentity, IMinMaxDayResponse } from "./interfaces";

import style from "./layoutClient.module.css";
import Cart from "./Cart";
import CartSkeleton from "./CartSkeleton";
import { dateFormatterNSN } from "@/app/utils/methods";
import Image from "next/image";
import Link from "next/link";
const LayoutClient = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { token, data, loadings, numOfCart } = useSelector(
    (data: IReduxStoreData) => data.user
  );

  const {
    districtMinTime,
    districtMaxTime,
    stateMaxTime,
    stateMinTime,
    countryMaxTime,
    countryMinTime,
  } = deliveryTime;

  const { cartPro, location } = data;
  const { state: userState, district: userDistrict } = location[0];

  const pendingData = cartPro.filter((obj) => !obj.name);

  const minMaxDay = useCallback(
    (
      stockInfo: Array<IStockInfoCartPro>,
      quantity: number
    ): IMinMaxDayResponse => {
      let stateQty = 0;
      let globalQty = 0;
      let districtQty = 0;
      stockInfo.forEach(({ district, qty, state }) => {
        const convert = Number(qty);
        if (userState === state) {
          stateQty += convert;
        }
        if (userDistrict === district) {
          districtQty += convert;
        }
        globalQty += convert;
      });

      let min = countryMinTime;
      let max = countryMaxTime;

      if (districtQty >= quantity) {
        min = districtMinTime;
        max = districtMaxTime;
      } else if (stateQty >= quantity) {
        min = stateMinTime;
        max = stateMaxTime;
      }
      const currentMs = Date.now() + indiaOffset;

      const minDay = new Date(msADay * min + currentMs);

      let maxDay = new Date(msADay * max + currentMs);
      return {
        globalQty,
        minDay: dateFormatterNSN(minDay).replace(
          String(new Date().getFullYear()),
          ""
        ),
        maxDay: dateFormatterNSN(maxDay),
      };
    },
    [userState, userDistrict]
  );

  const qtyChange = useCallback(
    (newQty: number, newDiscount: number, cartIdentity: ICartIdentity) => {
      dispatch(cartQtyChange({ newQty, newDiscount, cartIdentity }));
    },
    [dispatch]
  );
  const removeCarts = async (
    cartsInfo: Array<ICartProServer>
  ): Promise<IRemoveCartsRes> => {
    const request = await fetch(`/api/admin/user/cart/remove`, {
      method: "DELETE",
      body: JSON.stringify({ cartsInfo, token } as IRemoveCartsReq),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  };
  const deleteCart = useCallback(
    async (cartInfo: ICartProServer) => {
      dispatch(newLoading("Cart"));
      const response = await removeCarts([cartInfo]);
      dispatch(removeCart({ response, cartInfo }));
    },
    [dispatch]
  );

  useEffect(() => {
    const fetchCartProducts = async () => {
      const request = await fetch(`/api/admin/user/cart/products`, {
        method: "PATCH",
        body: JSON.stringify(pendingData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { success, message, data, deletedCartPros } =
        (await request.json()) as IFetchCartProductsRes;

      if (success) {
        const newCartPro: Array<ICartPro> = cartPro.flatMap((obj) => {
          const { _id, name, added } = obj;
          if (name) return obj;
          else {
            const findCart = data.find(
              (cart) => cart._id === _id && cart.added === added
            );
            if (findCart) return findCart;
            else return [];
          }
        });
        dispatch(dataKeyChange([{ name: "cartPro", value: newCartPro }]));
        if (deletedCartPros.length) {
          dispatch(
            mainKeyChange([
              { name: "loadings", value: loadings.concat("Cart") },
              { name: "numOfCart", value: newCartPro.length },
            ])
          );

          const { success, message } = await removeCarts(deletedCartPros);
          dispatch(
            newAlert({
              info: { text: message, type: success ? "Success" : "Error" },
              completed: "Cart",
            })
          );
        }
      } else {
        dispatch(
          newAlert({ info: { text: message, type: "Error", duration: "4s" } })
        );
        router.replace("/");
      }
    };

    if (pendingData.length && token) {
      fetchCartProducts();
    }
    if (!token) router.replace("/");
  }, []);

  return (
    <>
      {numOfCart === 0 && (
        <div className={style.empty}>
          <Image src={emptyCart} alt="Empty Cart" />
          <Link href={"/"}>Add Product</Link>
        </div>
      )}

      <div className={style.products}>
        {cartPro.map((obj) => {
          const { _id, option, name, variant } = obj;
          const key = `${_id}:${variant}:${option}`;
          return (
            <div className={style.cart} key={key} id={key}>
              {name ? (
                <Cart
                  data={obj}
                  minMaxDay={minMaxDay}
                  qtyChange={qtyChange}
                  deleteCart={deleteCart}
                />
              ) : (
                <CartSkeleton key={`${_id}${variant}${option}`} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LayoutClient;
