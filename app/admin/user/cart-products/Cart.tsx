"use client";
import React, { FC, memo, useRef, useState } from "react";
import { ICartProps } from "./interfaces";
import style from "./cart.module.css";
import Link from "next/link";
import Image from "next/image";
import { defaultRating } from "@/exConfig";

const Cart: FC<ICartProps> = ({ data, minMaxDay, qtyChange, deleteCart }) => {
  const qtyInput = useRef<HTMLInputElement | null>(null);
  const qtyOpt = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const {
    _id,
    name,
    sold,
    added,
    brand,
    category,
    discounts,
    imgSetKey,
    imgUrl,
    mrp,
    option,
    quantity,
    stockInfo,
    tOfP,
    variant,
    variantKey,
    rating,
    discount,
  } = data;

  const newDiscount = (newQty: number) => {
    return +(
      discounts.find((strValue) => {
        let qty = Number(strValue.split(":")[0]);
        if (qty >= newQty) return strValue;
      }) || (discounts[discounts.length - 1] as string)
    ).split(":")[1];
  };

  const minQty = Number(discounts[0].split(":")[0]);
  const [qtySubmitBtn, setQtySubmitBtn] = useState<boolean>(false);
  const { globalQty, minDay, maxDay } = minMaxDay(stockInfo, quantity);
  const qtyOptElement = (num: number) => (
    <option key={num} value={num}>
      {num}
    </option>
  );
  const currentPrice = mrp - mrp * (discount / 100);
  const outOfStock = globalQty < minQty;
  return (
    <>
      <div className={style.ratingReviews}>
        <p className={style.sold}>
          {qtySubmitBtn ? `Stock: ${globalQty}` : `Sold: ${sold}`}
        </p>

        <p className={style.rating}>
          <span style={{ width: `${rating || defaultRating * 20.2}%` }}>
            ★ ★ ★ ★ ★
          </span>
          ★ ★ ★ ★ ★
        </p>
      </div>
      <p className={style.name}>{name}</p>
      {outOfStock ? (
        <p className={style.outOfStock}>Out Of Stock</p>
      ) : (
        <p className={style.time}>
          Expected: <span>{minDay}</span>
          To <span>{maxDay}</span>
        </p>
      )}

      <Link
        className={style.imgCover}
        prefetch={false}
        key={_id}
        href={`/product/?_id=${_id}&k=${(name as string).replace(/ /g, "-")}`}
      >
        <Image
          className={style.img}
          src={imgUrl}
          height={400}
          width={400}
          alt="product image"
        />
      </Link>

      <div className={style.priceDiv}>
        <p className={style.currentPrice}>
          <span>₹</span>
          {(+currentPrice.toFixed()).toLocaleString("en-IN")}
        </p>
        {discount ? (
          <>
            <p className={style.discount}>-{discount}% Off</p>
            <p className={style.mrp}>
              M.R.P: ₹<span>{(+mrp.toFixed()).toLocaleString("en-IN")}</span>
            </p>
          </>
        ) : null}
      </div>

      <div className={style.qtyDiv}>
        <span>Qty : </span>
        <>
          {quantity <= 9 ? (
            <select
              onChange={(e) => {
                const value = +e.target.value;
                qtyChange(value, newDiscount(value), { _id, added });
              }}
              defaultValue={quantity}
              className={style.selectQty}
            >
              {outOfStock
                ? qtyOptElement(0)
                : qtyOpt.map(
                    (num) =>
                      minQty <= num && globalQty >= num && qtyOptElement(num)
                  )}
            </select>
          ) : (
            <div>
              <input
                ref={qtyInput}
                onChange={(e) => {
                  const value = +e.target.value;
                  if (
                    value &&
                    value !== quantity &&
                    value <= globalQty &&
                    minQty <= value
                  ) {
                    setQtySubmitBtn(true);
                  } else {
                    setQtySubmitBtn(false);
                  }
                }}
                name="inputQty"
                type="number"
                defaultValue={quantity}
              />
              <button
                style={{ display: qtySubmitBtn ? "unset" : "none" }}
                onClick={(e) => {
                  const qty = +(qtyInput.current as HTMLInputElement).value;
                  setQtySubmitBtn(false);
                  qtyChange(qty, newDiscount(qty), { _id, added });
                }}
                type="button"
              >
                Submit
              </button>
            </div>
          )}
        </>
        <span onClick={() => deleteCart({ _id, added, option, variant })}>
          Delete
        </span>
      </div>
      <div className={style.exDetails}>
        <div className={style.exFDiv}>
          {quantity > 1 && (
            <p className={style.total}>
              <span>Total</span>: ₹
              {(currentPrice * quantity).toLocaleString("en-IN")}
            </p>
          )}
          {variantKey && (
            <p>
              <span> {variantKey}</span>: {variant}
            </p>
          )}
          {imgSetKey && (
            <p>
              <span>{imgSetKey}</span>: {option}
            </p>
          )}
        </div>
        {discounts.length > 1 && (
          <div className={style.exSDiv}>
            <p>Discount:</p>
            {discounts.map((strValue) => {
              const [qty, dis] = strValue.split(":");
              return (
                <span key={dis}>
                  {qty} : -{dis}%
                </span>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(Cart);
