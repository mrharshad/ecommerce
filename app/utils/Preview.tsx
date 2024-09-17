import React, { FC, memo } from "react";
import styles from "./preview.module.css";
import Image from "next/image";
import { IProps } from "./interfaces/preview";
const Preview: FC<IProps> = ({ data, openDesign }) => {
  console.log("Preview rerender");
  const { name, thumbnail, exInfo } = data || {};
  const [
    first = "First : Value",
    second = "Second : Value",
    third = "Third : Value",
  ] = exInfo || [];

  return (
    <div id={styles.single} className={styles[openDesign]}>
      <div className={styles.ratingReviews}>
        <p className={styles.review}>Sold: 1000</p>
        <p className={styles.rating}>★ ★ ★ ★ ★</p>
      </div>

      <p className={styles.name}>{name || "Please enter name"}</p>
      <div className={styles.imgCover}>
        {thumbnail?.url ? (
          <Image
            className={styles.img}
            src={thumbnail.url}
            height={20}
            width={200}
            alt="product image"
          />
        ) : (
          <p className={styles.img}></p>
        )}
      </div>

      <div className={styles.priceDiv}>
        <p className={styles.charges}>
          <span>Free Shipping</span>
          <span>Free Packaging</span>
        </p>

        <p className={styles.currentPrice}>
          <span>₹</span>
          {"  15'999"}
        </p>

        <p className={styles.mrp}>
          M.R.P: ₹<span>{"19'999"}</span>
        </p>
        <p className={styles.discount}>23% Off</p>
      </div>

      <div className={styles.options}>
        {true ? (
          <div className={styles.delivery}>
            <p>Delivered :</p>
            <span>27 jun</span> To <span>05 April 2024</span>
          </div>
        ) : (
          <p>{first}</p>
        )}
        <p>{second}</p>
        <p>{third}</p>
      </div>
    </div>
  );
};

export default memo(Preview);
