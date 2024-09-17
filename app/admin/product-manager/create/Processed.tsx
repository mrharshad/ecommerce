import React, { FC, memo } from "react";
import { TProcesses } from "./interface";

const Processed: FC<{ opened: TProcesses; incomplete: TProcesses }> = ({
  incomplete,
  opened,
}) => {
  let width = "0%";
  switch (incomplete) {
    case 2:
      width = "33%";
      break;
    case 3:
      width = "65%";
      break;
    case 4:
      width = "100%";
      break;
    case 5:
      width = "100%";
      break;
  }
  return (
    <>
      <span style={{ color: opened === 1 ? "cyan" : "lightsteelblue" }}>
        Basic
      </span>
      <span style={{ color: opened === 2 ? "cyan" : "lightsteelblue" }}>
        Images
      </span>
      <span style={{ color: opened === 3 ? "cyan" : "lightsteelblue" }}>
        Variant
      </span>
      <span style={{ color: opened === 4 ? "cyan" : "lightsteelblue" }}>
        Price & Stock
      </span>
      <p>
        <span style={{ width }}></span>
      </p>
    </>
  );
};

export default memo(Processed);
