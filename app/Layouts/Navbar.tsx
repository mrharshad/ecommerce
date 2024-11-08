import Link from "next/link";
import { FC, memo } from "react";
import style from "./navbar.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";

interface INavbarProp {
  fName: string | undefined;
  token: string | null;
}

const Navbar: FC<INavbarProp> = ({ token, fName }) => {
  return (
    <>
      <input
        className={style.sideBarInput}
        type="checkbox"
        name="sideBarBtn"
        id="sideBarBtn"
      />

      <label className={style.dropBox} htmlFor="sideBarBtn"></label>
      <nav className={style.container} id="nav">
        <Link className={style.logo} href="/">
          <Image src={logo} width={150} height={100} alt="Website Logo" />
        </Link>

        <Link
          href={token ? "/admin/user/account" : `/user/login`}
          className={style.profileLogo}
        >
          <svg className={style.svg} viewBox="0 0 24 24">
            <path
              fill="#ffffff"
              d="M5.84846399,13.5498221 C7.28813318,13.433801 8.73442297,13.433801 10.1740922,13.5498221 C10.9580697,13.5955225 11.7383286,13.6935941 12.5099314,13.8434164 C14.1796238,14.1814947 15.2696821,14.7330961 15.73685,15.6227758 C16.0877167,16.317132 16.0877167,17.1437221 15.73685,17.8380783 C15.2696821,18.727758 14.2228801,19.3149466 12.4926289,19.6174377 C11.7216312,19.7729078 10.9411975,19.873974 10.1567896,19.9199288 C9.43008411,20 8.70337858,20 7.96802179,20 L6.64437958,20 C6.36753937,19.9644128 6.09935043,19.9466192 5.83981274,19.9466192 C5.05537891,19.9062698 4.27476595,19.8081536 3.50397353,19.6530249 C1.83428106,19.3327402 0.744222763,18.7633452 0.277054922,17.8736655 C0.0967111971,17.5290284 0.00163408158,17.144037 0.000104217816,16.752669 C-0.00354430942,16.3589158 0.0886574605,15.9704652 0.268403665,15.6227758 C0.72692025,14.7330961 1.81697855,14.1548043 3.50397353,13.8434164 C4.27816255,13.6914539 5.06143714,13.5933665 5.84846399,13.5498221 Z M8.00262682,-1.16351373e-13 C10.9028467,-1.16351373e-13 13.2539394,2.41782168 13.2539394,5.40035587 C13.2539394,8.38289006 10.9028467,10.8007117 8.00262682,10.8007117 C5.10240696,10.8007117 2.75131423,8.38289006 2.75131423,5.40035587 C2.75131423,2.41782168 5.10240696,-1.16351373e-13 8.00262682,-1.16351373e-13 Z"
              transform="translate(4 2)"
            ></path>
          </svg>
          <span className={style.span}>
            {fName ? fName?.substring(0, 8) : "Profile"}
          </span>
        </Link>

        <Link className={style.first} href={`/admin/user/new-orders`}>
          New Orders
        </Link>
        <Link href={`/admin/user/new-orders?docs=${1}`}>
          Canceled & Returns
        </Link>

        <Link href="/admin/user/new-orders">Delivered Orders</Link>

        <Link href="/decoration">Decoration</Link>
        <Link href="/">kitchen</Link>
        <Link href="/">Kids</Link>
        <Link href="/">Beauty & Health</Link>
        <Link href="/">Electronics</Link>
        <Link href="/">Sports & Fitness</Link>
        <Link href="/">Bags</Link>
        <Link href="/">Footwear</Link>
      </nav>
      <label className={style.sideBarBtn} htmlFor="sideBarBtn">
        <span className={style.first}></span>
        <span className={style.second}></span>
        <span className={style.third}></span>
      </label>
    </>
  );
};

export default memo(Navbar);
