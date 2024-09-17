import { FC, memo, useEffect, useState } from "react";
import style from "./toastAndWait.module.css";

import { IMainKeyChange } from "../redux/UserSliceInterface";
import { IAlert } from "../../interfaces/userClientSide";

interface IUserAlert {
  alerts: IAlert[];
  topLevelKey: (obj: IMainKeyChange) => void;
  replace: (path: string) => void;
  loading: boolean;
}
const UserAlert: FC<IUserAlert> = ({
  alerts,
  replace,
  loading,
  topLevelKey,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const { text, type, duration } = alerts[0] || {};

  const login = ["token is invalid", "token is expired"];
  for (let { text } of alerts) {
    if (login.includes(text)) {
      replace("/user/login");
    } else if (text === "reload") {
      window.location.reload();
    }
  }
  const color =
    type == "Success" ? "green" : type == "Message" ? "orange" : "red";
  const pendingAlert = alerts.length;
  useEffect(() => {
    const millisecond = parseFloat(duration || "2") * 1000;
    if (pendingAlert) {
      if (!visible) {
        setVisible(true);
        setTimeout(() => {
          topLevelKey({
            name: "alerts",
            value: alerts.filter((obj) => obj.text !== text),
          });
          setVisible(false);
        }, millisecond);
      }
    }
  }, [topLevelKey, text, alerts, duration, pendingAlert, visible]);
  return (
    <>
      <div
        style={{ display: loading ? "flex" : "none" }}
        className={style.fullSWait}
      >
        <div className={style.progressBar}>
          <p className={style.progressText}></p>
        </div>
      </div>
      <div
        style={{ display: pendingAlert ? "flex" : "none" }}
        className={style.UserAlert}
      >
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
      </div>
    </>
  );
};
export default memo(UserAlert);
