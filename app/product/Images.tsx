"use client";
import React, { FC, useState } from "react";
import { IImagesProps } from "./interface";
import Image from "next/image";
import style from "./images.module.css";

const Images: FC<IImagesProps> = ({ images }) => {
  const [selectedImg, setSelectedImg] = useState<number>(0);

  return (
    <>
      <div className={style.firstContainer}>
        <div className={style.images}>
          {images.map(({ _id, url }, index) => (
            <div
              onMouseLeave={() => setSelectedImg(index)}
              key={_id}
              className={
                selectedImg === index ? style.selectedImg : style.unSelectedImg
              }
            >
              <Image
                onClick={() => setSelectedImg(index)}
                height={400}
                width={400}
                alt="product image"
                src={url}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Images;
