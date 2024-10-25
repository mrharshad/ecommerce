import React, { FC, Fragment } from "react";
import SignUpComponent from "./SignUp";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authCookie } from "@/server/utils/tokens";

export const metadata = {
  title: "Sing Up",
};
const SignUp: FC = () => {
  const cookieStore = cookies();
  const loggedIn = cookieStore.get(authCookie.name)?.value;
  if (loggedIn) {
    redirect("/");
  }

  return (
    <Fragment>
      <SignUpComponent />
    </Fragment>
  );
};

export default SignUp;
