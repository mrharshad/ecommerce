import React, { FC } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import config from "@/server/config/config";
import Login from "./Login";
import { authCookie } from "@/server/utils/tokens";
export const metadata = {
  title: "Login",
};
const page: FC = () => {
  const cookieStore = cookies();
  const cookie = cookieStore.get(authCookie.name)?.value;
  if (cookie) {
    return redirect("/");
  }
  return <Login />;
};

export default page;
