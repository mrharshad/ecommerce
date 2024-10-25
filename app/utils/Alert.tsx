import React, { FC } from "react";
import { IAlert } from "../interfaces/user";
import styles from "./alert.module.css";
interface IProps extends IAlert {
  removeAlert: (text: string) => void;
}
const Alert: FC<IProps> = ({ text, type, duration, removeAlert }) => {
  let style: {};
  let color = "";
  switch (type) {
    case "Success":
      style = {
        background: "#00800012",
        boxShadow: `inset -2px -2px 1px 0px green`,
      };
      color = "green";
      break;
    case "Message":
      style = {
        background: "#ffa50017",
        boxShadow: `inset -2px -2px 1px 0px orange`,
      };
      color = "orange";
      break;
    default:
      style = {
        background: "#ff00000f",
        boxShadow: `inset -2px -2px 1px 0px red`,
      };
      color = "red";
  }

  const millisecond = parseFloat(duration || "2") * 1000;
  setTimeout(() => {
    removeAlert(text);
  }, millisecond);
  return (
    <div style={{ animationDuration: duration || "3s" }} className={styles.sos}>
      <div style={style}>
        <span style={{ color }}>{type}</span>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Alert;
