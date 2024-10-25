import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import Handler from "./Handler";
import { authCookie } from "@/server/utils/tokens";

export const generateMetadata = () => {
  return {
    title: "Create Product",
  };
};

const NewProduct = () => {
  const cookieStore = cookies();
  const value = cookieStore.get(authCookie.name)?.value;
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
