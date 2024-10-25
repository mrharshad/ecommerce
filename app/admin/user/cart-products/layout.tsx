import dynamic from "next/dynamic";

import { ILayoutProps } from "./interfaces";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
import { authCookie } from "@/server/utils/tokens";

const CartLayout = ({ children }: ILayoutProps) => {
  const value = cookies().get(authCookie.name);
  if (!value) return redirect("/user/login");
  const LayoutClient = dynamic(() => import("./LayoutClient"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
  });
  return (
    <section
      id="mainContent"
      style={{
        backgroundColor: "black",
        position: "relative",
        paddingBottom: "100px",
      }}
    >
      <LayoutClient />
      {children}
    </section>
  );
};
export default CartLayout;
