"use client";
import { useEffect, useState } from "react";
import style from "./page.module.css";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { mainKeyChange, newAlert } from "@/app/redux/UserSlice";
import { backEndServer } from "@/exConfig";
import { IServerResponse } from "@/server/utils/serverMethods";
import { ICancelProps } from "../interface";
import { IReduxStoreData } from "@/app/redux/ReduxStore";
import { TPending } from "@/app/interfaces/user";
import { TErrorMessages } from "@/server/utils/errorHandler";

const reasonOptions: Array<string> = [
  "Order Created By Mistake",
  "Item Would Not Arrive On Time",
  "Item Price Too High",
  "The price of the item has been reduced",
];

const Page = ({ params, searchParams }: ICancelProps) => {
  const [reason, setReason] = useState<string>("");
  const router = useRouter();
  const replace = router.replace;
  const { token, urlKey, loadings, alerts } = useSelector(
    (data: IReduxStoreData) => data.user
  );
  const dispatch = useDispatch();
  const btnHandler = async () => {
    const { hostname, protocol, tLD } = backEndServer;
    const value = reason.trim();
    if (loadings.length) return;
    if (value.length < 10)
      dispatch(
        mainKeyChange([
          {
            name: "alerts",
            value: [
              ...alerts,
              {
                text: "Reason must be longer than 10 characters",
                type: "Message",
              },
            ],
          },
        ])
      );
    else {
      dispatch(
        mainKeyChange([
          {
            name: "loadings",
            value: ["Order"] as Array<TPending>,
          },
        ])
      );
      const request = await fetch(
        `${protocol}${hostname}${tLD}/api/admin/order-cancel`,
        {
          method: "PUT",
          body: JSON.stringify({ ...searchParams, token, reason }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const { success, message } = (await request.json()) as IServerResponse;
      if (success) {
        dispatch(
          mainKeyChange([
            {
              name: "urlKey",
              value: { ...urlKey, orders: urlKey.orders + 1 },
            },
          ])
        );
        replace("/");
      }
      dispatch(
        newAlert({
          info: { type: success ? "Success" : "Error", text: message },
          completed: "Order",
        })
      );
      if (message === ("reload" as TErrorMessages)) {
        replace("/");
      }
    }
  };
  useEffect(() => {
    if (!token) {
      replace("/user/login");
    }
  }, [token, replace]);
  const another = reason && !reasonOptions.includes(reason);
  return (
    <div id="mainContent" className={style.container}>
      <div className={style.content}>
        <h1>Order Cancellation </h1>
        <svg onClick={() => router.back()}>
          <path
            fill="#FF0000"
            d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
          ></path>
          <path
            fill="#FF0000"
            d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
          ></path>
        </svg>

        <p className={style.firstPra}>
          Please tell me the reason for cancelling the order
        </p>
        <p className={style.secondPra}>Common Cause</p>
        <div>
          {reasonOptions.map((opt) => (
            <span
              onClick={() => setReason(opt)}
              style={{ color: opt === reason ? "red" : "gray" }}
              key={opt}
            >
              {opt}
            </span>
          ))}
          <span
            style={{
              color: another ? "red" : "gray",
            }}
            onClick={() => setReason("Another")}
          >
            Another
          </span>
        </div>
        {another && (
          <>
            <label htmlFor="writeReason">Write the reason</label>
            <textarea
              onChange={(event) => setReason(event.target.value)}
              name="writeReason"
              id="writeReason"
              placeholder="reason..."
            ></textarea>
          </>
        )}
        <button onClick={btnHandler} type="button">
          Cancel Order
        </button>
      </div>
    </div>
  );
};

export default Page;
