import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import config from "@/server/config/config";

import Handler from "./Handler";

export const generateMetadata = () => {
  return {
    title: "Create Product",
  };
};
const { cookieName } = config;
const NewProduct = () => {
  const cookieStore = cookies();
  const value = cookieStore.get(cookieName)?.value;
  if (!value) {
    notFound();
  }

  return (
    <>
      <Handler />
    </>
  );
};

export default NewProduct;
