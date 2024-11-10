"use client";
import Link from "next/link";
import React, { FC, useEffect } from "react";
import style from "./page.module.css";
import errorImg from "@/public/server error.png";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/ReduxStore";
import { newAlert } from "../redux/UserSlice";
interface IProps {
  params: string;
  searchParams: { msg: string; redirect?: string; text?: string };
}
const Page: FC<IProps> = ({ params, searchParams }) => {
  const { msg, redirect = "/", text = "Go to Home" } = searchParams;
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    dispatch(newAlert({ info: { text: msg, type: "Error", duration: "5s" } }));
  }, [msg]);
  return (
    <section className={style.container} id="mainContent">
      <Image alt="Server Error theme" src={errorImg} />
      <Link href={redirect}>{text}</Link>
    </section>
  );
};

export default Page;
