"use client";
import { FormEvent, useActionState, useEffect, useRef, useState } from "react";
import style from "./login.module.css";
import Link from "next/link";
import { authenticated, newAlert, newLoading } from "@/app/redux/UserSlice";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ILoginInfo, ILoginResponse } from "./interface";

import { IAlert } from "@/interfaces/userClientSide";
import { IReduxStoreData } from "@/app/redux/ReduxStore";

const Login = () => {
  const { alerts, searches } = useSelector(
    (data: IReduxStoreData) => data.user
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const passwordInput = useRef<HTMLInputElement | null>(null);
  const emailInput = useRef<HTMLInputElement | null>(null);
  const manageAlert = (info: IAlert, loading?: boolean) =>
    dispatch(newAlert({ info, completed: "Login" }));
  const showWarning = (text: string) => manageAlert({ text, type: "Message" });
  const forgotRes = (info: IAlert) => {
    dispatch(newAlert({ info, completed: "Login" }));
  };
  const isPending = (time: Date): boolean => {
    let milliseconds = new Date().getTime() - new Date(time).getTime();
    const minutes = Math.floor(milliseconds / (1000 * 60));
    let pendingHours = Math.floor(minutes / 60);
    let pendingMinutes = minutes % 60;
    pendingHours = pendingHours < 0 ? Math.abs(pendingHours) : 0;
    pendingMinutes = pendingMinutes < 0 ? Math.abs(pendingMinutes) : 0;

    if (pendingHours || pendingMinutes) {
      showWarning(
        `Try After ${pendingHours && `${pendingHours} hours`} ${
          pendingMinutes > 0 ? `: ${pendingMinutes} minutes` : ""
        } `
      );
      return true;
    } else return false;
  };
  const storeName = "loginInfo";
  const [loginInfo, setLoginInfo] = useState<ILoginInfo>({});
  let { holdOnVerification, reTryForgot } = loginInfo;

  const loginFunc = async (event: FormEvent) => {
    event.preventDefault();
    if ((holdOnVerification && isPending(holdOnVerification)) || alerts.length)
      return;
    dispatch(newLoading("Login"));
    const password = (passwordInput.current as HTMLInputElement).value;
    const email = (emailInput.current as HTMLInputElement).value;
    let user = await fetch(`/api/user/login`, {
      method: "PUT",
      body: JSON.stringify({
        email,
        password,
        searches,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resInfo = await user.json();
    const { success, text, resHoldOnVerification, data, token } =
      resInfo as ILoginResponse;
    if (success) {
      localStorage.removeItem(storeName);
      dispatch(authenticated({ text, data, token, completed: "Login" }));
      setTimeout(() => {
        router.back();
      }, 2000);
    } else {
      if (resHoldOnVerification) {
        const newInfo = {
          reTryForgot,
          holdOnVerification: resHoldOnVerification,
        };
        localStorage.setItem(storeName, JSON.stringify(newInfo));
        setLoginInfo(newInfo);
      }
      dispatch(
        newAlert({
          info: { text, type: "Error", duration: "4s" },
          completed: "Login",
        })
      );
    }
  };
  const forgotPassword = async () => {
    if ((reTryForgot && isPending(reTryForgot)) || alerts.length) return;
    const email = emailInput.current?.value.trim();
    if (!email) {
      return showWarning("please enter email");
    }
    dispatch(newLoading("Login"));
    let user = await fetch(`/api/user/forgot-password`, {
      method: "PUT",
      body: JSON.stringify({
        email,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { success, text, resReTryForget } = await user.json();
    console.log("success, text, resReTryForget", success, text, resReTryForget);
    if (resReTryForget) {
      const newInfo = { holdOnVerification, reTryForgot: resReTryForget };
      localStorage.setItem(storeName, JSON.stringify(newInfo));
      setLoginInfo(newInfo);
    }
    if (success) {
      forgotRes({ text, type: "Success" });
      router.replace("/");
    } else {
      forgotRes({ text, type: "Error" });
    }
  };
  useEffect(() => {
    let data = localStorage.getItem(storeName);
    if (data) setLoginInfo(JSON.parse(data));
  }, []);

  return (
    <section className={style.section}>
      <form className={style.form} onSubmit={loginFunc}>
        <h1>Login</h1>
        <p className={style.featureInfo}>
          Get access to your Orders, Wishlist, Cart, Delivery time and
          Recommendations
        </p>
        <label htmlFor="email">Email :</label>
        <input
          ref={emailInput}
          name="email"
          required
          id="email"
          type="email"
          placeholder="enter name"
        />
        <label htmlFor="password">Password :</label>
        <input
          ref={passwordInput}
          name="password"
          required
          id="password"
          type="password"
          placeholder="enter surname"
        />
        <span onClick={forgotPassword} className={style.forgotPassword}>
          Forgot Password
        </span>
        <button className={style.login} type="submit">
          Login
        </button>

        <p className={style.policy}>
          {" By continuing, you agree to riksham's"}
          <Link href="/user/conditions"> Conditions of Use </Link> and
          <Link href="/user/privacy-policy"> Privacy Notice </Link>.
        </p>
        <Link href="/user/sign-up">Create account</Link>
      </form>
    </section>
  );
};

export default Login;
