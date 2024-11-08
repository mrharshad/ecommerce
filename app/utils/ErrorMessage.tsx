import React, { FC } from "react";
import { TAlert } from "../interfaces/user";
import Link from "next/link";

const ErrorMessage: FC<{
  message: string;
  notification?: TAlert;
  redirect?: string;
  redirectText?: string;
}> = ({
  message,
  redirect = "/",
  redirectText = "Home",
  notification = "Error",
}) => {
  return (
    <div>
      <span>{notification}</span>
      <p>{message}</p>
      <Link href={redirect}>Go To {redirectText}</Link>
    </div>
  );
};

export default ErrorMessage;
