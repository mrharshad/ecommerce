"use client";
import React, { FC, useCallback, useEffect, useMemo } from "react";
import style from "./handler.module.css";
import { AppDispatch } from "@/app/redux/ReduxStore";
import { useDispatch, useSelector } from "react-redux";
import { IMainValueUpdate, IReduxCreateData } from "./interface";
import {
  appMount,
  getDrafts,
  mainKeyChange,
  newProDoc,
  removeAlert,
} from "@/app/redux/ProManagerSlice";
import BasicInformation from "./basic-information/Handler";

import SideBar from "./sideBar/Handler";
import { useRouter } from "next/navigation";
import Alert from "@/app/utils/Alert";

import ToggleProcess from "./ToggleProcess";
import ManageImage from "./manage-Images/Handler";
import Processed from "./Processed";
import { fetchCategory } from "./apiRequest";
import Variants from "./variants/Handler";
import PriceAndStock from "./priceAndStock/Handler";

const Handler: FC = () => {
  const router = useRouter();

  const {
    newData,
    fetchedCategories,
    loading,
    alerts = [],
    drafts,
    openedDraft,
    incomplete,
    opened,
  } = useSelector((data: IReduxCreateData) => data.proManager);

  const dispatch = useDispatch<AppDispatch>();
  const mainKeyFunc = useCallback(
    (obj: IMainValueUpdate) => {
      dispatch(mainKeyChange(obj));
    },
    [dispatch]
  );

  const { category, exInfo } = newData || {};

  const component = useMemo(() => {
    if (!exInfo) return;
    if (opened == 1) {
      return <BasicInformation />;
    } else if (opened == 2) {
      return <ManageImage />;
    } else if (opened == 3) {
      return <Variants />;
    } else if (opened == 4) {
      return <PriceAndStock />;
    }
  }, [opened]);

  useEffect(() => {
    dispatch(appMount());
    dispatch(getDrafts());
  }, [dispatch]);

  useEffect(() => {
    const data = fetchedCategories?.find((obj) => obj._id == category);
    if (!data && category) {
      dispatch(fetchCategory(category));
    }
  }, [dispatch, openedDraft]);

  const removeAlertFunc = useCallback(
    (text: string) => {
      dispatch(removeAlert(text));
      const login = ["token is invalid", "token is expired"];
      if (login.includes(text)) {
        router.push("/user/login");
      } else if (text === "reload") {
        window.location.reload();
      }
    },
    [dispatch, router]
  );

  return (
    <>
      <div
        style={{ display: loading?.length || !incomplete ? "flex" : "none" }}
        className={style.fullSWait}
      >
        <div className={style.progressBar}>
          <p className={style.progressText}></p>
        </div>
      </div>
      <div className={style.alerts}>
        {alerts.map(({ text, type, duration }, index) => (
          <Alert
            key={text + index}
            text={text}
            type={type}
            duration={duration}
            removeAlert={removeAlertFunc}
          />
        ))}
      </div>
      <section className={style.section}>
        <div className={style.header}>
          <h1>Create Product</h1>
          <button onClick={() => dispatch(newProDoc())}>New Document</button>
        </div>
        <SideBar data={newData} drafts={drafts} />
        <div key={opened} className={style.content}>
          <div className={style.processed}>
            <Processed opened={opened} incomplete={incomplete} />
          </div>
          {component}
          <ToggleProcess
            opened={opened}
            incomplete={incomplete}
            mainKeyFunc={mainKeyFunc}
          />
        </div>
      </section>
    </>
  );
};

export default Handler;
