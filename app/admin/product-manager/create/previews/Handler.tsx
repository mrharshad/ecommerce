import React, { FC, memo, useState } from "react";
import { INewData } from "../interface";
import style from "./PreHandler.module.css";
import { IPreview } from "@/interfaces/proManagerClientSide";
interface IProps {
  data: INewData;
}
const PreHandler: FC<IProps> = ({ data }) => {
  const [preview, setPreview] = useState<null | IPreview>(null);
  return (
    <>
      <div className={style.read}>
        <p>Preview :</p>
        <span> Quick</span>
        <span>Every</span>
      </div>
      <div className={style.device}>
        <p>Device :</p>
        <span>Mobile</span>
        <span>Tablet</span>
        <span>Laptop</span>
        <span>Desktop</span>
      </div>
    </>
  );
};

export default memo(PreHandler);
