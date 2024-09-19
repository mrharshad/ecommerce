import Link from "next/link";
import style from "./footer.module.css";

export default function Footer() {
  return (
    <footer id="footer" className={style.footer}>
      <div className={style.firstComponent}>
        <Link href="/service">Service</Link>
        <Link href="/contact-us">Contact Us</Link>
      </div>
      <div className={style.secondComponent}>
        <p>Connect With Us</p>
        <Link href="/">Facebook</Link>
        <Link href="/">Instagram</Link>
        <Link href="/">Twitter</Link>
      </div>
    </footer>
  );
}
