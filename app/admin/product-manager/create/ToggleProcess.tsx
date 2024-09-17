import { FC, memo } from "react";
import { IToggleProcess } from "./interface";
import style from "./toggleProcess.module.css";
const ToggleProcess: FC<IToggleProcess> = ({
  opened,
  incomplete,
  mainKeyFunc,
}) => {
  const back = opened !== 1;
  const next = opened !== 4 && opened < incomplete;
  if (!incomplete) return;

  return (
    <div className={style.container}>
      {back && (
        <button
          onClick={() => mainKeyFunc({ name: "opened", value: opened - 1 })}
          style={{ marginRight: "auto" }}
          type="button"
        >
          Back
        </button>
      )}
      {next && (
        <button
          onClick={() => {
            mainKeyFunc({ name: "opened", value: opened + 1 });
          }}
          style={{ marginLeft: "auto" }}
          type="button"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default memo(ToggleProcess);
