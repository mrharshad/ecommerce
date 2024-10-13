import React, { FC, memo } from "react";
import style from "./searchProductSkeletons.module.css";

const SearchProductSkeletons: FC<{ numOfSkeleton: number }> = ({
  numOfSkeleton,
}) => {
  const skeletons = Array(numOfSkeleton).fill(0);
  skeletons.length = numOfSkeleton;
  return (
    <>
      {skeletons.map((id, index) => (
        <div key={index} className={style.product}>
          <div className={style.ratingReviews}></div>
          <p className={style.name}></p>
          <div className={style.imgCover}></div>
          <div className={style.options}>
            <p></p>
            <p></p>
            <p></p>
          </div>
        </div>
      ))}
    </>
  );
};

export default SearchProductSkeletons;
