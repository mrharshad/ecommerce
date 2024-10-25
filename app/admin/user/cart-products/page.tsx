import PageClient from "./PageClient";
import { frontEndServer } from "@/exConfig";
const { hostname, tLD } = frontEndServer;
export const metadata = {
  title: "Your Cart",
  description: `Cart : ${hostname}${tLD}: Products`,
};

const Page = () => {
  return (
    <>
      <PageClient />
    </>
  );
};

export default Page;
