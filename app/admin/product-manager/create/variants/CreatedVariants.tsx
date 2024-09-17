import React, { FC, memo } from "react";
import { ICreatedVariantsProps } from "./interface";
import style from "./createdVariants.module.css";
import { IVariant } from "../interface";
const CreatedVariants: FC<ICreatedVariantsProps> = ({
  variants,
  newProKeyFunc,
  selectedVariant,
  setSelected,
  createBtn,
}) => {
  const deleteVariant = (_id: string) => {
    newProKeyFunc([
      { name: "variants", value: variants.filter((obj) => obj._id !== _id) },
    ]);
    if (selectedVariant === _id) {
      setSelected({ variant: "", imgSets: [], info: "" });
    }
  };

  const totalVariants = variants.length;
  const orderChange = (index: number, move: "left" | "right") => {
    let newData = [...variants];
    const siblingData =
      move === "left" ? variants[index - 1] : variants[index + 1];

    newData = newData.with(index, siblingData);

    const clickedData = variants[index];
    newData = newData.with(
      move === "right" ? index + 1 : index - 1,
      clickedData
    );
    newProKeyFunc([{ name: "variants", value: newData }]);
  };
  const toggleVariant = (obj: IVariant) => {
    const btn = createBtn.current?.style;
    if (btn) btn.display = "none";
    const { _id, options, info } = obj;
    if (selectedVariant === _id) {
      setSelected({ variant: "", imgSets: [], info: "" });
    } else {
      setSelected({
        variant: _id,
        imgSets: options.map((opt) => opt._id),
        info,
      });
    }
  };
  return (
    <div className={style.created}>
      <p>
        Created Variants : <span>Total: </span>[ {totalVariants} ]
      </p>
      <div className={style.variants}>
        {variants.map((obj, index) => {
          const { _id } = obj;
          return (
            <div
              style={
                selectedVariant === _id
                  ? {
                      color: "#0cff0c",
                    }
                  : {}
              }
              key={_id}
              className={style.variant}
            >
              {totalVariants > 1 && index > 0 ? (
                <svg
                  onClick={() => orderChange(index, "left")}
                  viewBox="0 0 512 512"
                >
                  <path
                    d="m327.3 98.9-2.1 1.8-156.5 136c-5.3 4.6-8.6 11.5-8.6 19.2 0 7.7 3.4 14.6 8.6 19.2L324.9 411l2.6 2.3c2.5 1.7 5.5 2.7 8.7 2.7 8.7 0 15.8-7.4 15.8-16.6V112.6c0-9.2-7.1-16.6-15.8-16.6-3.3 0-6.4 1.1-8.9 2.9z"
                    fill=" #ffffff"
                  ></path>
                </svg>
              ) : null}
              {totalVariants > 1 && totalVariants > index + 1 ? (
                <svg
                  onClick={() => orderChange(index, "right")}
                  viewBox="0 0 512 512"
                >
                  <path
                    d="m184.7 413.1 2.1-1.8 156.5-136c5.3-4.6 8.6-11.5 8.6-19.2 0-7.7-3.4-14.6-8.6-19.2L187.1 101l-2.6-2.3C182 97 179 96 175.8 96c-8.7 0-15.8 7.4-15.8 16.6v286.8c0 9.2 7.1 16.6 15.8 16.6 3.3 0 6.4-1.1 8.9-2.9z"
                    fill="#ffffff"
                  ></path>
                </svg>
              ) : null}
              <p onClick={() => toggleVariant(obj)}>{_id}</p>
              {totalVariants > 1 && (
                <svg
                  className={style.deleteSvg}
                  onClick={() => deleteVariant(_id)}
                >
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(CreatedVariants);
