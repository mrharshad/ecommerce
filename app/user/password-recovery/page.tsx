import React, { FC, Fragment } from "react";
import Recovery from "./recovery";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import config from "@/server/config/config";
import { IParams } from "./recoveryInterface";
import { ICheckTokenValidityRes } from "./interface";
const page: FC<IParams> = async ({ searchParams }) => {
  const { cookieName, bProtocol, bHost } = config;
  const token = searchParams.key;
  const email = searchParams.email;

  const cookieStore = cookies();

  const loggedIn = cookieStore.get(cookieName)?.value;
  if (loggedIn || !token || !email) {
    redirect("/");
  }
  const req = await fetch(
    `${bProtocol}${bHost}/api/user/check-token-validity?key=${token}&email=${email}
        `,
    {
      cache: "no-cache",
    }
    // { next: { revalidate: 21600 } }
  );
  const { success, message } = (await req.json()) as ICheckTokenValidityRes;
  if (!success) {
    if (message === "invalid token") {
      redirect("/");
    }
    if (message === "token expired") {
      redirect("/user/login");
    }
  }

  return (
    <Fragment>
      <Recovery token={token} email={email} />
    </Fragment>
  );
};

export default page;
