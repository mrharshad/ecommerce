import React, { FC } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import config from "@/server/config/config";
import Login from "./Login";
export const metadata = {
  title: "Login",
};
const page: FC = () => {
  const { cookieName } = config;
  const cookieStore = cookies();
  const cookie = cookieStore.get(cookieName)?.value;
  if (cookie) {
    return redirect("/");
  }
  return <Login />;
};

export default page;
