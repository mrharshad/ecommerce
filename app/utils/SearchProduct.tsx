import { ISearchProduct } from "@/interfaces/productServerSide";
import style from "./searchProduct.module.css";
import Link from "next/link";
import React, { FC, memo } from "react";
import Image from "next/image";

const SearchProduct: FC<{ data: ISearchProduct }> = ({ data }) => {
  const {
    _id,
    brand,
    category,
    discount,
    exInfo,
    name,
    price,
    rating,
    sold,
    tOfP,
    thumbnail,
    popular,
    mrp,
  } = data;
  const [first, second, third] = exInfo;
  return (
    <Link
      className={style.single}
      prefetch={false}
      key={_id}
      href={`/product/?_id=${_id}&k=${name.replace(/ /g, "-")}`}
    >
      <div className={style.ratingReviews}>
        <p className={style.review}>Sold: {sold}</p>

        <p className={style.rating}>
          <span style={{ width: `${rating * 20.2}%` }}>★ ★ ★ ★ ★</span>★ ★ ★ ★ ★
        </p>
      </div>

      <p className={style.name}>{name}</p>
      <div className={style.imgCover}>
        <Image
          className={style.img}
          src={thumbnail}
          height={20}
          width={200}
          alt="product image"
        />
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
        <p>{first}</p>
        <p>{second}</p>
        <p>{third}</p>
      </div>
    </Link>
  );
};

export default memo(SearchProduct);
