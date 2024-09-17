import React, { FC } from "react";
import { IAlert } from "../../interfaces/userClientSide";
import style from "./alert.module.css";
interface IProps extends IAlert {
  removeAlert: (text: string) => void;
}
const Alert: FC<IProps> = ({ text, type, duration, removeAlert }) => {
  const color =
    type == "Success" ? "green" : type == "Message" ? "orange" : "red";
  const millisecond = parseFloat(duration || "2") * 1000;
  setTimeout(() => {
    removeAlert(text);
  }, millisecond);
  return (
    <div
      style={{
        boxShadow: `inset -2px -2px 1px 0px ${color}`,
        animationDuration: duration || "3s",
      }}
      className={style.sos}
    >
      <span style={{ color }}>{type}</span>
      <p>{text}</p>
    </div>
  );
};

export default Alert;
