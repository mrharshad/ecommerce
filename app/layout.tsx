import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./redux/store-provider";
import Header from "./Layouts/Header";
import config from "@/server/config/config";
import { cookies } from "next/headers";
import { ICartPro, IReduxUserData } from "@/interfaces/userClientSide";
import Footer from "./Layouts/Footer";

const { fDomainName, cookieName, bHost, bProtocol } = config;
const inter = Inter({ subsets: ["latin"] });
interface IFetch {
  success: boolean;
  text: string;
  data: IReduxUserData;
}

export const metadata: Metadata = {
  title: fDomainName,
  description: "Create by mrharshad",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  let value = cookieStore.get(cookieName)?.value;
  let userData = { cartPro: [] as ICartPro[] } as IReduxUserData;
  if (value) {
    const req = await fetch(
      `${bProtocol}${bHost}/api/admin/user/data/${value}
        `,
      { cache: "no-cache" }
      // { next: { revalidate: 21600 } }
    );
    const { success, text, data }: IFetch = await req.json();
    if (success) userData = data;
  }
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
