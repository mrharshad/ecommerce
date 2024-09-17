import React, {
  ChangeEvent,
  EventHandler,
  FC,
  memo,
  MouseEvent,
  useState,
} from "react";
import { IExInfosProps } from "./interface";
import style from "./exInfo.module.css";
const ExInfo: FC<IExInfosProps> = ({
  exInfo,
  newProKeyFunc,
  showAlert,
  capitalize,
}) => {
  const inputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target.value.trim();
    const key = target.name;
    let updated = exInfo.map((obj) => {
      if (obj.key == key) {
        return { ...obj, value };
      } else {
        return obj;
      }
    });
    newProKeyFunc([{ name: "exInfo", value: updated }]);
  };
  const deleteInfo = (index: number) => {
    const data = exInfo[index];
    if (data.required)
      return showAlert({
        text: `${data.key}: key is required can't delete`,
        type: "Message",
      });
    newProKeyFunc([
      {
        name: "exInfo",
        value: exInfo.filter((obj, indexData) => indexData !== index),
      },
    ]);
  };
  const orderChange = (index: number, move: "top" | "bottom") => {
    let newData = [...exInfo];
    const siblingData = move === "top" ? exInfo[index - 1] : exInfo[index + 1];
    if (siblingData.sameOrder)
      return showAlert({
        text: `${siblingData.key}: order cannot be changed`,
        type: "Message",
        duration: "4s",
      });
    newData = newData.with(index, siblingData);

    const clickedData = exInfo[index];
    if (clickedData.sameOrder)
      return showAlert({
        text: `${clickedData.key}: order cannot be changed`,
        type: "Message",
        duration: "4s",
      });
    newData = newData.with(
      move === "bottom" ? index + 1 : index - 1,
      clickedData
    );
    newProKeyFunc([{ name: "exInfo", value: newData }]);
  };
  const showBottom = exInfo.length - 1;
  const addInfo = (formData: FormData) => {
    const key = capitalize((formData.get("key") as string).trim());
    const value = (formData.get("value") as string).trim();
    if (key.length < 2 || value.length < 2)
      return showAlert({ text: `Enter Information...`, type: "Message" });
    if (exInfo.some((obj) => obj.key === key))
      return showAlert({ text: `${key}: already exists`, type: "Message" });

    newProKeyFunc([
      {
        name: "exInfo",
        value: [...exInfo, { key, value, required: false }],
      },
    ]);
  };
  return (
    <div className={style.container}>
      <p>Ex - Information :</p>

      <form action={addInfo} className={style.newInfo}>
        <input name="key" type="text" minLength={2} placeholder="key..." />
        <button type="submit">Add</button>
        <textarea name="value" minLength={2} placeholder="value..." />
      </form>
      <div className={style.exInfos}>
        {exInfo.map(({ key, required, sameOrder, value }, index) => {
          return (
            <div className={style.info} key={key}>
              <p>{key}</p>
              <div>
                {!required && (
                  <svg name={`${key}`} onClick={() => deleteInfo(index)}>
                    <path
                      fill="#FF0000"
                      d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
                    ></path>
                    <path
                      fill="#FF0000"
                      d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
                    ></path>
                  </svg>
                )}

                {index > 0 && (
                  <svg
                    className={style.top}
                    onClick={() => orderChange(index, "top")}
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="m184.7 413.1 2.1-1.8 156.5-136c5.3-4.6 8.6-11.5 8.6-19.2 0-7.7-3.4-14.6-8.6-19.2L187.1 101l-2.6-2.3C182 97 179 96 175.8 96c-8.7 0-15.8 7.4-15.8 16.6v286.8c0 9.2 7.1 16.6 15.8 16.6 3.3 0 6.4-1.1 8.9-2.9z"
                      fill="#3385ff"
                    ></path>
                  </svg>
                )}
                {index < showBottom && (
                  <svg
                    className={style.bottom}
                    onClick={() => orderChange(index, "bottom")}
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="m184.7 413.1 2.1-1.8 156.5-136c5.3-4.6 8.6-11.5 8.6-19.2 0-7.7-3.4-14.6-8.6-19.2L187.1 101l-2.6-2.3C182 97 179 96 175.8 96c-8.7 0-15.8 7.4-15.8 16.6v286.8c0 9.2 7.1 16.6 15.8 16.6 3.3 0 6.4-1.1 8.9-2.9z"
                      fill="#3385ff"
                    ></path>
                  </svg>
                )}
              </div>
              <textarea
                name={key}
                placeholder="type description..."
                onChange={inputChange}
                defaultValue={value}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(ExInfo);
