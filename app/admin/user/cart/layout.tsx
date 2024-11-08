import dynamic from "next/dynamic";
import style from "./layout.module.css";
import { ILayoutProps } from "./interfaces";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
import { authCookie } from "@/server/utils/tokens";
import CartSkeleton from "./CartSkeleton";

const CartLayout = ({ children }: ILayoutProps) => {
  const value = cookies().get(authCookie.name);
  if (!value) return redirect("/user/login");
  const LayoutClient = dynamic(() => import("./LayoutClient"), {
    ssr: false,
    loading: () => (
      <div className={style.cart}>
        <CartSkeleton key={`layout Skeleton`} />
      </div>
    ),
  });
  return (
    <section className={style.container} id="mainContent">
      <LayoutClient />

      {children}
    </section>
  );
};
export default CartLayout;
