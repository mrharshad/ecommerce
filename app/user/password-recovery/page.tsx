import React, { FC, Fragment } from "react";
import Recovery from "./recovery";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import config from "@/server/config/config";
import { IParams } from "./recoveryInterface";
const page: FC<IParams> = async ({ searchParams }) => {
  const { cookieName } = config;
  const token = searchParams.key;
  const email = searchParams.email;

  const cookieStore = cookies();

  const loggedIn = cookieStore.get(cookieName)?.value;
  if (loggedIn || !token || !email) {
    redirect("/");
  }

  return (
    <Fragment>
      <Recovery token={token} email={email} />
    </Fragment>
  );
};

export default page;
