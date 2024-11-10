import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Login from "./Login";
import { authCookie } from "@/server/utils/tokens";
export const metadata = {
  title: "Login",
};
const Page = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(authCookie.name)?.value;
  if (cookie) {
    return redirect("/");
  }
  return <Login />;
};

export default Page;
