"use client";
import { AppDispatch, IReduxStoreData } from "@/app/redux/ReduxStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./buy.module.css";
import { dataKeyChange, newLoading, newOrder } from "@/app/redux/UserSlice";
import phonePeQR from "@/public/phonePeQR.png";
import Link from "next/link";
import { backEndServer, orderManage } from "@/exConfig";
import { getUserContacts } from "@/app/redux/UserApiRequest";
import { ILocation } from "@/server/interfaces/user";
import {
  INewOrderReq,
  INewOrderRes,
} from "@/app/redux/UserApiRequestInterface";
const Buy = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const [oneTime, oneTimeSet] = useState(false);
  const [openBox, setOpenBox] = useState(true);
  const [isPayOnD, setIsPayOnD] = useState<boolean | null>(null);

  const { token, data, loadings, numOfCart, searches, device } = useSelector(
    (data: IReduxStoreData) => data.user
  );

  const { fName, lName, cartPro, location, mobileNo, email } = data;
  const numOfLocations = location.length;
  const copyLocation = useMemo(() => {
    return [...location];
  }, [numOfLocations]);

  const changeLocation = (_id: Date) => {
    const newLocation = location.filter((obj) => obj._id != _id);
    const findLocation = location.find((obj) => obj._id === _id) as ILocation;
    newLocation.unshift(findLocation);
    dispatch(dataKeyChange([{ name: "location", value: newLocation }]));
  };

  const isLoading = useMemo(() => {
    return cartPro.some((obj) => !obj.name);
  }, [cartPro]);

  const { elementsId, totalItems, amount, finalMrp } = useMemo(() => {
    let elementsId: Array<string> = [];
    let totalItems = 0;
    let finalMrp = 0;
    let amount = 0;

    if (!isLoading) {
      for (let {
        _id,
        quantity,
        variant,
        option,
        discount,
        mrp,
        stockInfo,
      } of cartPro) {
        const stock = stockInfo.reduce(
          (accumulator, current) => accumulator + current.qty,
          0
        );
        if (stock < quantity) {
          elementsId.push(`${_id}:${variant}:${option}`);
        } else {
          const totalMrp = mrp * quantity;
          totalItems += quantity;
          finalMrp += totalMrp;
          amount += Math.round(totalMrp - totalMrp * (discount / 100));
        }
      }
    }

    return { totalItems, elementsId, finalMrp, amount };
  }, [cartPro]);

  const finalDiscount = ((finalMrp - amount) / finalMrp) * 100;
  const {
    _id: locationId,
    address,
    area,
    district,
    pinCode,
    state,
  } = location[0];
  const changeStyle = (opacity: 0 | 10, elementIds: Array<string>) => {
    for (let id of elementIds) {
      const parentElement = document.getElementById(id);
      if (parentElement) {
        const style = parentElement.style;
        style.opacity = opacity as any;
        setTimeout(() => {
          parentElement.style.display = opacity ? "grid" : "none";
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (elementsId.length) {
      changeStyle(0, elementsId);
    }
    if (!email && token) {
      dispatch(getUserContacts(token));
    }
    if (!isLoading && !totalItems) router.replace("/admin/user/cart");
    const styleElement = document.getElementById("mainContent")?.style;
    if (device === "Mobile" && styleElement) {
      styleElement.paddingBottom = "0px";
    }
    return () => {
      if (elementsId.length) changeStyle(10, elementsId);

      if (styleElement) styleElement.paddingBottom = "100px";
    };
  }, [elementsId]);
  const createOrder = async () => {
    const { hostname, protocol, tLD } = backEndServer;
    if (!loadings.length) dispatch(newLoading("Order"));
    const request = await fetch(
      `${protocol}${hostname}${tLD}/api/admin/user/new-order`,
      {
        method: "POST",
        body: JSON.stringify({
          token,
          state,
          address,
          area,
          district,
          openBox,
          pinCode,
          oneTime,
          cartPro,
          fullName: `${fName} ${lName}`,
          email,
          mobileNo,
          searches,
        } as INewOrderReq),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const response = (await request.json()) as INewOrderRes;
    dispatch(newOrder(response));
    if (response.success) setTimeout(() => router.replace("/"), 10);
  };

  return !totalItems ? (
    <div className={style.noStock}>Out Of Stocks</div>
  ) : (
    <div className={style.mainDiv}>
      <p>Delivery Information</p>
      {numOfCart > 1 && (
        <div id={style.oneTime} className={style.openBox}>
          <p>One time delivery :</p>
          <span
            onClick={() => oneTimeSet(true)}
            style={{ color: oneTime ? "aqua" : "white" }}
          >
            Yes
          </span>
          <span
            onClick={() => oneTimeSet(false)}
            style={{ color: !oneTime ? "aqua" : "white" }}
          >
            No
          </span>
          <span>
            Do you want all products at the time of final product delivery?
          </span>
        </div>
      )}
      <div className={style.changeLocation}>
        <input type="checkbox" name="changeLocation" id="changeLocation" />

        <div className={style.openBox}>
          <p>Open Box :</p>
          <span
            onClick={() => setOpenBox(true)}
            style={{ color: openBox ? "aqua" : "white" }}
          >
            Yes
          </span>{" "}
          <span
            onClick={() => setOpenBox(false)}
            style={{ color: !openBox ? "aqua" : "white" }}
          >
            No
          </span>
        </div>
        {numOfLocations > 1 && (
          <>
            <label
              className={style.toggleLocation}
              htmlFor="changeLocation"
            ></label>
            <div className={style.locations}>
              {copyLocation.map(({ address, area, pinCode, _id }, index) => (
                <div
                  key={`${_id}`}
                  style={{
                    borderColor: locationId == _id ? "deepskyblue" : "gray",
                  }}
                  onClick={() => changeLocation(_id)}
                >
                  <p>PinCode: {pinCode}</p>
                  <p>Area: {area}</p>
                  <p>Address: {address}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={style.deliveryInfo}>
        <p>
          Full Name:
          <span>
            {fName} {lName}
          </span>
        </p>
        <p>
          Mobile Number:
          <span>{mobileNo}</span>
        </p>

        <p>
          Email: <span> {email} </span>
        </p>
        <p>
          PinCode: <span> {pinCode} </span>
        </p>
        <p>
          Area: <span> {area} </span>
        </p>
        <p>
          District: <span> {district} </span>
        </p>
        <p>
          State: <span> {state} </span>
        </p>
        <p>
          Address: <span> {address} </span>
        </p>
      </div>
      <p>Payment Option</p>

      <span className={style.condition}>
        By placing your order, you agree to {"Website's"}
        <Link href={"/privacy"}>privacy notice</Link>
        and <Link href={"/conditions"}>conditions of use</Link>.
      </span>
      <div className={style.finalAmount}>
        <p>
          Total Amount: <span>₹{amount?.toLocaleString("en-IN")}</span>
        </p>
        {finalDiscount ? (
          <>
            <p>Save:</p>
            <span>₹{(finalMrp - amount).toLocaleString("en-IN")}</span>
            <span>-{finalDiscount.toFixed(2)}%</span>
          </>
        ) : null}
        <p className={style.items}>
          Number Of Items: <span>{totalItems}</span>
        </p>
      </div>
      {(isPayOnD || isPayOnD === null) && (
        <button onClick={() => setIsPayOnD(isPayOnD ? null : true)}>
          Pay on Delivery
        </button>
      )}
      <div className={style.cod}>
        {!loadings.length && isPayOnD && (
          <button onClick={createOrder}>Order Now</button>
        )}
      </div>
      {!isPayOnD && (
        <button onClick={() => setIsPayOnD(isPayOnD === null ? false : null)}>
          PrePayment
        </button>
      )}
      <div
        className={style.prePay}
        style={{ maxHeight: isPayOnD === false ? "1000px" : "0px" }}
      >
        <p>Bank Transfer Instructions: (NO TRANSITION CHARGE)</p>
        <p>Please transfer the pay amount to the following bank account</p>
        <p>BHIM/UPI ID: riksham.com@ybl</p>
        <p>ACCOUNT HOLDER NAME: Harshad Sahu</p>
        <p>ACCOUNT NUMBER: 6127020100007572</p>
        <p>ISFC CODE: UBIN0561274</p>
        <p>SEND US THE CONFIRMATION / SCREENSHOT WITH THE ORDER ID ON</p>
        <a
          className={style.sendScreenShort1}
          href={`mailto:${orderManage.mail}`}
        >
          Mail: <span>{orderManage.mail}</span>
        </a>
        <a
          className={style.sendScreenShort2}
          href={`tel:${orderManage.phoneNo}`}
        >
          Whatsapp: <span> {orderManage.phoneNo}</span>
        </a>
        <p>FROM YOUR REGISTERED EMAIL OR MOBILE NUMBER.</p>
        <Image src={phonePeQR} alt="bar code" height={150} width={150} />
      </div>
    </div>
  );
};

export default Buy;
