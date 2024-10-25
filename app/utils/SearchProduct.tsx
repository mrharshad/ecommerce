import { ISearchProduct } from "@/server/interfaces/product";
import style from "./searchProduct.module.css";
import Link from "next/link";
import React, { FC, memo } from "react";
import Image from "next/image";

const SearchProduct: FC<{ data: ISearchProduct }> = ({ data }) => {
  const { _id, discount, exInfo, name, price, rating, sold, thumbnail, mrp } =
    data;
  const [first, second, third] = exInfo;
  const [fKey, fValue] = first.split(":");
  const [sKey, sValue] = second.split(":");
  const [tKey, tValue] = third.split(":");

  return (
    <Link
      className={style.container}
      prefetch={false}
      key={_id}
      href={`/product/?_id=${_id}&k=${name.replace(/ /g, "-")}`}
    >
      <div className={style.ratingReviews}>
        <p className={style.review}>Sold: {sold}</p>

        <p className={style.rating}>
          <span style={{ width: `${rating || 4 * 20.3}%` }}>★ ★ ★ ★ ★</span>★ ★
          ★ ★ ★
        </p>
      </div>

      <p className={style.name}>{name}</p>
      <div className={style.imgCover}>
        <Image src={thumbnail} height={400} width={400} alt="product image" />
      </div>

      <div className={style.priceDiv}>
        <p className={style.charges}>
          Free <span>Shipping</span>
        </p>

        <p className={style.currentPrice}>
          <span>₹</span>
          {price.toLocaleString("en-IN")}
        </p>
        {discount > 0 && (
          <>
            <p className={style.mrp}>
              M.R.P: ₹<span>{mrp}</span>
            </p>
            <p className={style.discount}>{discount}% Off</p>
          </>
        )}
      </div>
      <div className={style.options}>
        <p>
          <span>{fKey}</span>
          <span>{fValue}</span>
        </p>
        <p>
          <span>{sKey}</span>
          <span>{sValue}</span>
        </p>
        <p>
          <span>{tKey}</span>
          <span>{tValue}</span>
        </p>
      </div>
    </Link>
  );
};

export default memo(SearchProduct);
