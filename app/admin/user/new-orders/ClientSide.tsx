"use client";
import React, { FC, useEffect } from "react";
import { INewOrdersClientParams } from "./interface";
import { useSelector } from "react-redux";
import { IReduxStoreData } from "@/app/redux/ReduxStore";
import { useRouter } from "next/navigation";

const ClientSide: FC<INewOrdersClientParams> = ({ docs }) => {
  const { urlKey } = useSelector((data: IReduxStoreData) => data.user);
  const newKey = urlKey.orders;
  const router = useRouter();
  useEffect(() => {
    if (newKey && newKey > docs) {
      router.replace(`/admin/user/new-orders?docs=${newKey}`);
    }
  }, [newKey, docs, router]);
  return <></>;
};

export default ClientSide;
