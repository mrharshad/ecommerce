import { frontEndServer } from "@/exConfig";
import dynamic from "next/dynamic";
import React from "react";
const { hostname, tLD } = frontEndServer;
export const metadata = {
  title: "Buy Now",
  description: `Buy : ${hostname}${tLD}: Products`,
};
const page = () => {
  const Buy = dynamic(() => import("./Buy"), {
    ssr: false,
  });
  return <Buy />;
};

export default page;
