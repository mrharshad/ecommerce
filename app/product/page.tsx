import React, { FC } from "react";
import { IGetProductRes, IProps, TStarRating } from "./interface";
import { notFound } from "next/navigation";
import style from "./page.module.css";
import Image from "next/image";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { ILocation } from "@/server/interfaces/user";

import { IImageSets } from "@/server/interfaces/product";
import Link from "next/link";
import Images from "./Images";
import {
  backEndServer,
  deliveryTime,
  frontEndServer,
  indiaOffset,
  msADay,
} from "@/exConfig";
import { locationCookie } from "@/server/utils/tokens";

export function generateMetadata({ params, searchParams }: IProps) {
  const productName = searchParams.k.split("-").join(" ");

  const { hostname, tLD } = frontEndServer;
  const data = `${productName} : ${hostname} ${tLD}: Product`;
  return {
    title: data,
    description: data,
  };
}
const page: FC<IProps> = async ({ params, searchParams }) => {
  try {
    const { hostname, protocol, tLD } = backEndServer;
    const Handler = dynamic(() => import("./Handler"), { ssr: false });
    const {
      districtMinTime,
      districtMaxTime,
      stateMaxTime,
      stateMinTime,
      countryMaxTime,
      countryMinTime,
    } = deliveryTime;
    const cookie = cookies();
    const location = cookie.get(locationCookie.name)?.value;
    const dateFormatter = new Intl.DateTimeFormat("en-In", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const { district, state, area }: ILocation = location
      ? JSON.parse(location)
      : {};
    const { _id, o, v } = searchParams;

    const productId = Number(_id);
    const selectedOption = Number(o) || 0;

    const selectedVariant = Number(v) || 0;

    if (!productId) {
      notFound();
    }

    const request = await fetch(
      `${protocol}${hostname}${tLD}/api/product/${_id}`,
      {
        cache: "no-cache",
      }
    );

    const { success, data } = (await request.json()) as IGetProductRes;
    if (!success) {
      notFound();
    }

    const {
      name,
      rating,
      sold,
      description,
      exInfo,
      certificates,
      reviews,
      imageSets,
      variants,
      variantKey,
      tOfP,
      imgSetKey,
      category,
      stars,
    } = data;
    const proUrl = `/product?_id=${_id}&k=${name.replace(/ /g, "-")}`;
    const {
      _id: variantId,
      info,
      discounts,
      options,
    } = variants[selectedVariant];

    const optionNames = options.map(({ _id }) => _id);
    const variantNames = variants.map(({ _id }) => _id);

    const { loc, _id: optionId, mrp } = options[selectedOption];
    const { images } = imageSets.find(
      (obj) => obj._id === optionId
    ) as IImageSets;

    let stateQty: number = 0;
    let districtQty: number = 0;
    let globalQty: number = 0;

    loc.forEach((stateInfo) => {
      const [sta, dis, qty] = stateInfo.split(":");

      const convert = Number(qty);
      if (sta === state) {
        stateQty += convert;
      }
      if (dis === district) {
        districtQty += convert;
      }
      globalQty += convert;
    });

    let [min, dis] = discounts[0].split(":");

    const discountOpts = discounts.flatMap((data, index) => {
      if (index === 0) {
        return [];
      } else {
        const [min, dis] = data.split(":");
        return { min, dis };
      }
    });
    const minQty = Number(min);
    const discount = Number(dis);
    const currentMs = Date.now() + indiaOffset;
    const minimumDays = new Date(
      currentMs +
        msADay *
          (districtQty >= minQty
            ? districtMinTime
            : stateQty >= minQty
            ? stateMinTime
            : countryMinTime)
    );
    let maximumDays = new Date(
      currentMs +
        msADay *
          (districtQty >= minQty
            ? districtMaxTime
            : stateQty >= minQty
            ? stateMaxTime
            : countryMaxTime)
    );
    const { one, two, three, four, five } = stars;
    const ratingElement = (star: TStarRating, percent: number) => {
      return (
        <p>
          {star} Star
          <span
            style={{
              boxShadow: `inset ${percent * 1.2}px 0px 0px 0px green`,
            }}
          ></span>
          {percent}%
        </p>
      );
    };

    const exInfoElements: Array<JSX.Element> = [];

    exInfo.push(...info.split("\n").filter((pair) => pair.trim()));

    for (let info of exInfo) {
      const [key, value] = info.split(":");
      exInfoElements.push(
        <div className={style.pairInfo} key={key}>
          <p className={style.key}>{key}</p>
          <p className={style.value}>{value}</p>
        </div>
      );
    }

    return (
      <>
        <section id="mainContent" className={style.section}>
          <h1>{name}</h1>
          <div className={style.firstDiv}>
            <p>Sold: {sold}</p>
            <p className={style.rating}>
              ★ ★ ★ ★ ★
              <span style={{ width: `${rating || 4 * 20.2}%` }}>★ ★ ★ ★ ★</span>
            </p>
          </div>
          <Images images={images} />
          <Handler
            productId={productId}
            tOfPName={tOfP}
            categoryName={category}
            variantId={variantId}
            optionId={optionId}
          />
          <div className={style.secondDiv}>
            <p className={style.delivery}>
              Delivered:{" "}
              <span>
                {dateFormatter
                  .format(minimumDays)
                  .replace(String(new Date().getFullYear()), "")}
              </span>
              To <span>{dateFormatter.format(maximumDays)}</span>
            </p>
            {minQty > 1 && (
              <p className={style.minOrder}>
                Orders less than {minQty} pieces will{" "}
                <span> not be accepted </span>
              </p>
            )}
            <div>
              {minQty > globalQty ? (
                <p className={style.stock}>Out Of Stock</p>
              ) : (
                <p style={{ color: "green" }} className={style.stock}>
                  In-Stock
                </p>
              )}

              {minQty < globalQty && minQty * 6 > globalQty && (
                <p className={style.lowStock}>
                  Only {globalQty} {tOfP} left
                </p>
              )}
            </div>
            <div className={style.price}>
              <p className={style.current}>
                <span> ₹</span>
                {(+(
                  discount ? mrp - mrp * (discount / 100) : mrp
                ).toFixed()).toLocaleString("en-IN")}
              </p>
              {discount ? (
                <>
                  <p className={style.discount}>-{dis}%</p>
                  <p className={style.mrp}>
                    M.R.P: <span>₹{mrp}</span>
                  </p>
                </>
              ) : null}
            </div>
            <div className={style.allOptions}>
              {variantKey && (
                <div className={style.options}>
                  <p>{variantKey}</p>
                  <div>
                    {variantNames.map((opt, index) => (
                      <Link
                        style={
                          index === selectedVariant
                            ? {
                                backgroundColor: "white",
                                border: "1px solid",
                              }
                            : {}
                        }
                        key={index}
                        href={proUrl + (index ? `&v=${index}` : "")}
                      >
                        {opt}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {imgSetKey && (
                <div className={style.options}>
                  <p>{imgSetKey}</p>
                  {optionNames.map((opt, index) => (
                    <Link
                      href={
                        proUrl +
                        (selectedVariant ? `&v=${selectedVariant}` : "") +
                        (index ? `&o=${index}` : "")
                      }
                      style={
                        index === selectedOption
                          ? {
                              backgroundColor: "white",
                              border: "1px solid",
                            }
                          : {}
                      }
                      key={index}
                    >
                      {opt}
                    </Link>
                  ))}
                </div>
              )}

              {discountOpts.length > 0 && (
                <div id={style.discounts} className={style.options}>
                  <p>Quantity Discount</p>
                  <div>
                    {discountOpts.map(({ min, dis }, index) => (
                      <span key={index}>
                        {min} : -{dis}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={style.productInfo}>
            <p>Product Information</p>

            {exInfoElements}

            <div className={style.description}>{description}</div>

            <div className={style.additionDiv}>
              {certificates.map(({ _id, added, image, verified }) => (
                <div className={style.certificate} key={_id}>
                  <p>{_id}</p>
                  <Image
                    alt="certificate"
                    width={200}
                    height={100}
                    key={_id}
                    src={image}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={style.reviewContainer}>
            <h5>Reviews from people who have bought</h5>
            {sold > 0 ? (
              <div className={style.ratingInPercent}>
                <span
                  style={{
                    color:
                      rating > 3.9 ? "green" : rating > 2.5 ? "gold" : "red",
                  }}
                >
                  {rating} ★
                </span>
                {ratingElement(5, five)}
                {ratingElement(4, four)}
                {ratingElement(3, three)}
                {ratingElement(2, two)}
                {ratingElement(1, one)}
              </div>
            ) : (
              <p className={style.noReviews}>No Reviews</p>
            )}

            <div className={style.reviews}>
              {reviews.map(
                ({
                  _id,
                  delivered,
                  district,
                  name,
                  rating,
                  state,
                  comment,
                }) => (
                  <div key={_id}>
                    <p className={style.name}>{name}</p>
                    <p className={style.star}>
                      <span
                        style={{
                          width: `${rating * 20}%`,
                          color: rating ? "gold" : "gray",
                        }}
                      >
                        ★ ★ ★ ★ ★
                      </span>
                    </p>
                    <p className={style.reviewCreated}>{delivered}</p>
                    <p className={style.comment}>
                      ({`${district} :`} {state}) : {comment}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </>
    );
  } catch (err) {
    notFound();
  }
};
export default page;
