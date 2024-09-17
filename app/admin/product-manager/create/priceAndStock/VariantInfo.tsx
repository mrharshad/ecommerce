import React, { FC, FormEvent, memo, useRef, useState } from "react";
import { IVariantInfo } from "./interface";
import style from "./variantInfo.module.css";
import Image from "next/image";
const VariantInfo: FC<IVariantInfo> = ({
  imageSets,
  variant,
  updatePurchased,
  createUpdateDisOpt,
  removeDisOpt,
  setOptionDataFunc,
}) => {
  const { _id: variantId, discounts, purchased, options } = variant;
  const addDiscountBtn = useRef<HTMLButtonElement | null>(null);
  const qtyInput = useRef<HTMLInputElement | null>(null);
  const disInput = useRef<HTMLInputElement | null>(null);

  const [newPurchased, setNewPurchased] = useState(purchased);

  const submitDisOpt = (event: FormEvent) => {
    event.preventDefault();
    const minQty = qtyInput.current as HTMLInputElement;
    const dis = disInput.current as HTMLInputElement;
    const btnStyle = (addDiscountBtn.current as HTMLButtonElement).style;
    const result = createUpdateDisOpt(+minQty.value, +dis.value, variant);
    if (result) {
      btnStyle.display = "none";
      dis.value = "";
      minQty.value = "";
    }
  };

  const openOption = (optionId: string) => {
    setOptionDataFunc({ ...variant, optionId });
  };
  return (
    <div className={style.container}>
      <p>{variantId}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (purchased !== newPurchased) {
            updatePurchased(newPurchased, variant);
          }
        }}
        className={style.purchased}
      >
        <label htmlFor="purchased">
          {newPurchased == purchased
            ? "Purchased: -%"
            : `-${purchased}% Previous:`}
        </label>
        <input
          onChange={(e) => {
            const value = +e.target.value.trim();
            setNewPurchased(value);
          }}
          defaultValue={purchased}
          type="number"
          id="purchased"
          name="purchased"
        />
        {newPurchased != purchased && <button type="submit">Set</button>}
      </form>
      <form onSubmit={submitDisOpt} className={style.newDiscount}>
        <label htmlFor="qty">Qty:</label>
        <input
          onChange={(event) => {
            const value = event.target.value;
            const btnStyle = (addDiscountBtn.current as HTMLButtonElement)
              .style;
            if (value) {
              btnStyle.display = "unset";
            } else {
              btnStyle.display = "none";
            }
          }}
          ref={qtyInput}
          type="number"
          name="qty"
          placeholder="Qty..."
          required
          min={1}
          defaultValue={1}
        />
        <label htmlFor="dis">Discount:</label>

        <input
          ref={disInput}
          type="number"
          name="dis"
          placeholder="%"
          min={0}
          required
          defaultValue={12}
        />
        <button ref={addDiscountBtn} type="submit">
          Create
        </button>
      </form>
      <div className={style.discounts}>
        {discounts.map(({ min, discount }) => (
          <p key={min}>
            <span>Qty: {min}</span>
            <span>-{discount}%</span>
            <svg
              onClick={() => removeDisOpt(discount, variant)}
              className={style.deleteBtn}
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
          </p>
        ))}
      </div>
      <div className={style.options}>
        {options.map(({ _id, mrp, loc }) => (
          <div
            onClick={() => {
              openOption(_id);
            }}
            key={_id}
            style={{ borderColor: loc.length ? "lightsteelblue" : "gray" }}
          >
            <p>{_id}</p>
            <Image
              width={300}
              height={300}
              src={
                imageSets.find((obj) => obj._id === _id)?.images[0] as string
              }
              alt="Product Image"
            />

            <span>{mrp || ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(VariantInfo);
