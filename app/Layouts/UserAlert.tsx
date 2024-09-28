import { FC, memo } from "react";
import style from "./userAlert.module.css";

import Alert from "../utils/Alert";
import { IUserAlert } from "./interface";

const UserAlert: FC<IUserAlert> = ({ alerts, loading, removeAlert }) => {
  return (
    <>
      <div
        style={{ display: loading.length ? "flex" : "none" }}
        className={style.fullSWait}
      >
        <div className={style.progressBar}>
          <p className={style.progressText}></p>
        </div>
      </div>
      <div className={style.alerts}>
        {alerts.map(({ text, type, duration }, index) => (
          <Alert
            key={text + index}
            text={text}
            type={type}
            duration={duration}
            removeAlert={removeAlert}
          />
        ))}
      </div>
    </>
  );
};
export default memo(UserAlert);
