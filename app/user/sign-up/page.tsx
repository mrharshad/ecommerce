import React, { FC, Fragment } from "react";
import SignUpComponent from "./signUp";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import config from "@/server/config/config";

export const metadata = {
  title: "Sing Up",
};
const signUp: FC = () => {
  const { cookieName } = config;
  const cookieStore = cookies();
  const loggedIn = cookieStore.get(cookieName)?.value;
  if (loggedIn) {
    redirect("/");
  }

  return (
    <Fragment>
      <SignUpComponent />
    </Fragment>
  );
};

export default signUp;
