import React, { FC, Fragment } from "react";
import Recovery from "./Recovery";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import config from "@/server/config/config";
import { IParams } from "./recoveryInterface";
import { ICheckTokenValidityRes } from "./interface";
import { backEndServer } from "@/exConfig";
import { authCookie } from "@/server/utils/tokens";
const page: FC<IParams> = async ({ searchParams }) => {
  const { hostname, protocol, tLD } = backEndServer;
  const token = searchParams.key;
  const email = searchParams.email;

  const cookieStore = cookies();

  const loggedIn = cookieStore.get(authCookie.name)?.value;
  if (loggedIn || !token || !email) {
    redirect("/");
  }
  const req = await fetch(
    `${protocol}${hostname}${tLD}/api/user/check-token-validity?key=${token}&email=${email}
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
