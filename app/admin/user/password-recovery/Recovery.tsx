"use client";
import React, { FC, FormEvent, MutableRefObject, useRef } from "react";
import style from "./recovery.module.css";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";
import { IRecoveryParams } from "./recoveryInterface";
import { authenticated, newAlert, newLoading } from "@/app/redux/UserSlice";

import { IReduxStoreData } from "@/app/redux/ReduxStore";
import { INewPasswordRes } from "./interface";
import { backEndServer } from "@/exConfig";

const Recovery: FC<IRecoveryParams> = ({ token: key, email }) => {
  const dispatch = useDispatch();
  const { alerts, searches, districts } = useSelector(
    (data: IReduxStoreData) => data.user
  );
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPassword = useRef<HTMLInputElement | null>(null);
  const buttonRef: MutableRefObject<HTMLButtonElement | null> =
    useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const setData = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const length = target.value.length;
    const password = passwordRef.current?.value;
    const confPassValue = confirmPassword.current?.value;
    target.style.borderColor =
      length > 7
        ? "green"
        : length > 5
        ? "yellow"
        : length > 0
        ? "red"
        : "white";
    const current = buttonRef.current;
    if (current) {
      const style = current.style;
      if (length > 7 && password === confPassValue) {
        style.visibility = "visible";
        style.opacity = "10";
      } else {
        style.visibility = "hidden";
        style.opacity = "0";
      }
    }
  };

  const setPassword = async () => {
    if (alerts.length) return;
    const password = (passwordRef.current as HTMLInputElement).value;
    const confPassValue = (confirmPassword.current as HTMLInputElement).value;
    const { hostname, protocol, tLD } = backEndServer;
    if (password.length > 7 && confPassValue === password) {
      dispatch(newLoading("Recovery-Password"));
      const verify = await fetch(
        `${protocol}${hostname}${tLD}/api/admin/user/new-password`,
        {
          method: "PUT",
          body: JSON.stringify({
            password,
            key,
            email,
            searches,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { success, message, token, data }: INewPasswordRes =
        await verify.json();

      if (success) {
        dispatch(
          authenticated({
            text: message,
            token,
            data,
            completed: "Recovery-Password",
          })
        );
        router.replace("/");
      } else {
        dispatch(
          newAlert({
            info: { text: message, type: "Error", duration: "4s" },
            completed: "Recovery-Password",
          })
        );
      }
    }
  };
  return (
    <section id="productUser" className={style.section}>
      <div className={style.container}>
        <h1>Set New Password:</h1>
        <div className={style.password}>
          <label>Password:</label>
          <input ref={passwordRef} onChange={setData} type="password" />
        </div>
        <div className={style.confirmPassword}>
          <label>Re-enter:</label>
          <input ref={confirmPassword} onChange={setData} type="password" />
        </div>
        <button ref={buttonRef} onClick={setPassword} type="button">
          Set Password
        </button>
        <p>
          {"If you don't want to change the password"}
          <Link href="/">Click Here</Link>
        </p>
      </div>
    </section>
  );
};

export default Recovery;
