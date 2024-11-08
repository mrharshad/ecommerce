import { backEndServer, frontEndServer } from "@/exConfig";
import { IOrderDocs } from "@/server/interfaces/user";
import { authCookie, orderDocsCookie } from "@/server/utils/tokens";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { FC } from "react";
import emptyOrder from "@/public/empty orders.png";
import { IGetNewOrdersResponse, INewOrdersParams } from "./interface";
import { TErrorMessages } from "@/server/utils/errorHandler";
import ErrorMessage from "@/app/utils/ErrorMessage";
import Link from "next/link";
import style from "./page.module.css";
import { dateFormatterNSN } from "@/app/utils/methods";

import Handler from "./Handler";
import dynamic from "next/dynamic";

const { hostname, tLD } = frontEndServer;
export const metadata = {
  title: "Your Orders",
  description: `Product : ${hostname}${tLD}: Orders`,
};

const page: FC<INewOrdersParams> = async ({ params, searchParams }) => {
  const docs = Number(searchParams.docs) || 0;
  const getCookie = cookies().get;
  const token = getCookie(authCookie.name)?.value;
  const orderDocCookie = getCookie(orderDocsCookie.name)?.value;
  const ClientSide = dynamic(() => import("./ClientSide"), { ssr: false });
  if (!token) return redirect("/user/login");
  let newOrder =
    (orderDocCookie && (JSON.parse(orderDocCookie) as IOrderDocs).newOrder) ||
    0;
  const { hostname, protocol, tLD } = backEndServer;
  const request = newOrder
    ? await fetch(
        `${protocol}${hostname}${tLD}/api/admin/user/new-orders?token=${token}`,
        {
          cache: "no-cache",
        }
      )
    : ({} as Response);

  const { success, message, data } = newOrder
    ? ((await request.json()) as IGetNewOrdersResponse)
    : ({ success: true } as IGetNewOrdersResponse);

  if (message === ("token is expired" as TErrorMessages))
    return redirect("/user/login");

  return (
    <section className={style.container} id="mainContent">
      {newOrder && success ? (
        <div className={style.orders}>
          {data.map(
            ({
              _id: orderId,
              createdAt,
              items,
              openBox,
              pinCode,
              oneTime,
              tofPay,
              address,
              area,
              fullName,
              mobileNo,
            }) => {
              const lastDelivery = dateFormatterNSN(
                new Date(
                  Math.max(
                    ...items.map((item) => new Date(item.expected).getTime())
                  )
                )
              );
              const orderInfoId = `orderInfo:${orderId}`;
              return (
                <div key={orderId} className={style.order}>
                  <Handler id={orderInfoId} key={orderInfoId} />
                  <div className={style.items}>
                    {items.map(
                      ({
                        _id,
                        expected,
                        imgUrl,
                        message,
                        name,
                        price,
                        quantity,
                        status,
                        update,
                        imgSetKey,
                        variantKey,
                      }) => {
                        const [itemId, variant, option] = _id.split(":");
                        const amount = Math.round(price * quantity);
                        return (
                          <div key={`${orderId}:${_id}`} className={style.item}>
                            <div className={style.name}>
                              <p>{name} </p>
                              <span>{variantKey && variant}</span>
                              {imgSetKey && <span>{option}</span>}
                              <Link
                                href={{
                                  pathname: `/admin/user/new-orders/cancel/`,
                                  query: {
                                    orderId,
                                    _id,
                                  },
                                }}
                              >
                                Cancel
                              </Link>
                            </div>
                            <p>
                              <span>Status:</span>
                              {status}
                            </p>
                            <p>
                              <span>Arriving:</span>
                              {oneTime
                                ? dateFormatterNSN(new Date(expected))
                                : lastDelivery}
                            </p>
                            <Link
                              className={style.imgCover}
                              prefetch={false}
                              href={`/product?_id=${itemId}&k=${(
                                name as string
                              ).replace(/ /g, "-")}`}
                            >
                              <Image
                                className={style.img}
                                src={imgUrl}
                                height={400}
                                width={400}
                                alt="product image"
                              />
                            </Link>
                            <span>Qty: {quantity}</span>
                            <span>
                              Total: {amount.toLocaleString("en-IN")}
                            </span>{" "}
                            <p className={style.message}>
                              {message || "No Message"}
                            </p>
                            <p>
                              <span>Update:</span>
                              {dateFormatterNSN(new Date(update))}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                  <label className={style.toggleInfoBtn} id={orderInfoId}>
                    Delivery Info...
                  </label>
                  <div className={style.orderInfo}>
                    <p>
                      <span>Name on Receipt:</span>
                      {fullName}
                    </p>
                    <p>
                      <span>Address:</span>
                      {address}
                    </p>
                    <p>
                      <span>Area:</span>
                      {area}
                    </p>
                    <p>
                      <span>PinCode:</span>
                      {pinCode}
                    </p>
                    <p>
                      <span>Mobile No:</span>
                      {mobileNo}
                    </p>
                    <p>
                      <span>Order Placed:</span>
                      {dateFormatterNSN(new Date(createdAt))}
                    </p>

                    <p>
                      <span>Payment Type:</span>
                      {tofPay}
                    </p>

                    {openBox && (
                      <p>
                        <span>Open Box</span>: Yes
                      </p>
                    )}
                    {oneTime && (
                      <p>
                        <span> One Time</span>: Yes
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : !success ? (
        <ErrorMessage message={message} />
      ) : (
        <div className={style.empty}>
          <Image src={emptyOrder} alt="empty order" />
          <Link href={"/"}>Go to Home</Link>
        </div>
      )}
      <ClientSide docs={docs} />
    </section>
  );
};

export default page;
