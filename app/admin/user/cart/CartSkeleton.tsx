import React from "react";
import style from "./cartSkeleton.module.css";
const CartSkeleton = () => {
  return (
    <>
      <div className={style.ratingReviews}></div>
      <p className={style.name}></p>
      <p></p>
      <div>
        <p className={style.image}></p>
      </div>

      <div id={style.priceQtyDiv} className={style.ratingReviews}></div>

      <div className={style.exDetails}>
        <p className={style.name}></p>
        <p className={style.name}></p>
      </div>
    </>
  );
};

export default CartSkeleton;
