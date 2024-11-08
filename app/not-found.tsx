import Image from "next/image";
import React from "react";
import notFound from "@/public/page not found .png";
import Link from "next/link";
const NotFound = () => {
  return (
    <section
      id="mainContent"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "55px",
      }}
    >
      <Image
        alt="Not-Found"
        src={notFound}
        style={{ maxWidth: "90%", height: "fit-content" }}
      />
      <Link
        href={"/"}
        style={{
          marginTop: "20px",
          borderRadius: "3px",
          fontWeight: "600",
          color: "#30c330",
          fontSize: "large",
        }}
      >
        Go to Home
      </Link>
    </section>
  );
};

export default NotFound;
