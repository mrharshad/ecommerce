import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./redux/store-provider";
import Header from "./Layouts/Header";
import { cookies } from "next/headers";

import Footer from "./Layouts/Footer";

import { authCookie } from "@/server/utils/tokens";
import { backEndServer, frontEndServer } from "@/exConfig";
import { IClientSideShared } from "@/server/interfaces/user";

const inter = Inter({ subsets: ["latin"] });
export interface IFetch {
  success: boolean;
  text: string;
  data: IClientSideShared;
}

const { hostname, protocol, tLD } = backEndServer;
export const metadata: Metadata = {
  title: frontEndServer.hostname,
  description: "Create by mrharshad",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  let value = cookieStore.get(authCookie.name)?.value;
  let userData = {} as IClientSideShared;
  if (value) {
    const req = await fetch(
      `${protocol}${hostname}${tLD}/api/admin/user/data/${value}
        `,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
      // { next: { revalidate: 21600 } }
    );
    const { success, text, data }: IFetch = await req.json();
    if (success) userData = data;
  }
  console.log("userData", userData.fName);
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <Header userData={userData} initialToken={value || null} />
          {children}
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
