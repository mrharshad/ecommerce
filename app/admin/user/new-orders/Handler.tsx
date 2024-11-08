"use client";

import { useEffect } from "react";

interface IProps {
  id: string;
}
const OrderInfoHandler = ({ id }: IProps) => {
  useEffect(() => {
    const toggleElement = document.getElementById(id) as HTMLLabelElement;
    const containerElement = toggleElement.nextElementSibling as HTMLDivElement;
    const clickHandler = () => {
      const style = containerElement.style as CSSStyleDeclaration;
      const btnStyle = toggleElement.style as CSSStyleDeclaration;
      const display = style.display;
      if (display === "none" || display === "") {
        style.display = "flex";
        setTimeout(() => {
          style.opacity = "10";
        }, 200);
        btnStyle.color = "green";
      } else {
        setTimeout(() => {
          style.display = "none";
        }, 1000);
        style.opacity = "0";
        btnStyle.color = "#607D8B";
      }
    };
    toggleElement.addEventListener("click", clickHandler);
    return () => {
      toggleElement.removeEventListener("click", clickHandler);
    };
  }, [id]);
  return <></>;
};

export default OrderInfoHandler;
