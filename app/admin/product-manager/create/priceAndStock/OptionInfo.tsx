import React, { ChangeEvent, FC, memo, useMemo, useRef, useState } from "react";
import {
  IInfoData,
  IOptionInfoProps,
  ISelectedVariant,
  IStocks,
} from "./interface";
import style from "./optionInfo.module.css";
import stateOfIndia from "@/static-data/stateOfIndia";
import { IVariantOption } from "../interface";
const OptionInfo: FC<IOptionInfoProps> = ({
  data,
  listOfLocation,
  location,
  mainKeyChangeFunc,
  newAlertFunc,
  setData,
  updateOption,
}) => {
  const { _id, optionId, options } = data || ({} as ISelectedVariant);
  const mrpInput = useRef<HTMLInputElement | null>(null);
  const [stocks, setStocks] = useState<Array<IStocks>>([]);
  const mrp = useMemo(() => {
    const { mrp, loc } =
      options?.find((opt) => opt._id == optionId) || ({} as IVariantOption);
    if (loc) {
      const newData: Array<IStocks> = [];
      const infoData: IInfoData = {};
      for (let info of loc) {
        const [state, district, stock] = info.split(":");
        const districts = infoData[state];
        const disData = { name: district, stock: Number(stock) };
        if (districts) {
          infoData[state] = [...districts, disData];
        } else {
          infoData[state] = [disData];
        }
      }
      for (let state in infoData) {
        newData.push({ state, districts: infoData[state] });
      }
      setStocks(newData);
    }
    return mrp;
  }, [optionId, options]);

  const { state, district } = location;
  const districts = useMemo(() => {
    return listOfLocation.find((obj) => obj.state === state)
      ?.districts as Array<string>;
  }, [state, listOfLocation]);

  if (!_id) return;
  const createNewStock = (fromData: FormData) => {
    const state = fromData.get("state") as string;
    const district = fromData.get("district") as string;
    const stock = Number(fromData.get("stock") as string);
    if (stock < 1) {
      return newAlertFunc({ type: "Message", text: "Enter Stock Quantity" });
    }

    setStocks((pre) => {
      const findState = pre.findIndex((obj) => obj.state === state);
      const newDisData = { name: district, stock };
      if (findState >= 0) {
        const districts = pre[findState].districts;

        const newDistricts = districts.filter((obj) => obj.name !== district);
        newDistricts.push(newDisData);
        const newStock = [...pre];
        newStock[findState] = {
          state,
          districts: newDistricts,
        };
        return newStock;
      } else {
        return [...pre, { state, districts: [newDisData] }];
      }
    });
  };
  const changeState = (e: ChangeEvent<HTMLSelectElement>) => {
    mainKeyChangeFunc({
      name: "location",
      value: { district, state: e.target.value },
    });
  };
  const changeDistrict = (e: ChangeEvent<HTMLSelectElement>) => {
    mainKeyChangeFunc({
      name: "location",
      value: { state, district: e.target.value },
    });
  };
  const removeDistrict = (state: string, name: string) => {
    setStocks((pre) => {
      const copy = [...pre];
      const findState = copy.findIndex((obj) => obj.state == state);
      const { districts } = copy[findState];
      if (districts.length > 1) {
        copy[findState] = {
          state,
          districts: districts.filter((obj) => obj.name !== name),
        };
        return [...copy];
      } else {
        return copy.filter((obj) => obj.state !== state);
      }
    });
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <svg
          className={style.cancel}
          onClick={() => setData(null)}
          fill="#FF0000"
          width="800px"
          height="800px"
          viewBox="0 0 16 16"
        >
          <g>
            <polygon points="13.63 3.65 12.35 2.38 8 6.73 3.64 2.38 2.37 3.65 6.72 8.01 2.38 12.35 3.65 13.63 8 9.28 12.35 13.64 13.63 12.36 9.27 8.01 13.63 3.65" />
          </g>
        </svg>
        <h4>Selected :</h4>
        <span>
          {"("} Variant : {_id} {") =>"}
        </span>

        <span> Option: {optionId}</span>
        <label htmlFor="mrp" className={style.updateMrp}>
          M.R.P :
          <input ref={mrpInput} defaultValue={mrp || 1} type="number" min={1} />
        </label>
      </div>
      <div className={style.stocksInfo}>
        {stocks.map(({ state, districts }) => (
          <div key={state} className={style.state}>
            <p>State: {state}</p>
            {districts.map(({ name, stock }) => (
              <div key={name}>
                <span>{name} :</span>
                <span>{stock}</span>
                <svg
                  onClick={() => removeDistrict(state, name)}
                  fill="#FF0000"
                  width="800px"
                  height="800px"
                  viewBox="0 0 16 16"
                >
                  <g>
                    <polygon points="13.63 3.65 12.35 2.38 8 6.73 3.64 2.38 2.37 3.65 6.72 8.01 2.38 12.35 3.65 13.63 8 9.28 12.35 13.64 13.63 12.36 9.27 8.01 13.63 3.65" />
                  </g>
                </svg>
              </div>
            ))}
          </div>
        ))}
      </div>
      <form action={createNewStock} className={style.newStoreStock}>
        <div>
          <label htmlFor="state">State</label>
          <select
            onChange={changeState}
            defaultValue={state}
            name="state"
            id="state"
          >
            {stateOfIndia.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className={style.districtOpt}>
          <label htmlFor="district">District:</label>
          <select
            onChange={changeDistrict}
            defaultValue={district}
            name="district"
            id="district"
          >
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
        <label className={style.stockLabel} htmlFor="stock">
          Stock
        </label>
        <input
          type="number"
          id="stock"
          name="stock"
          min={1}
          defaultValue={10}
        />

        <button type="submit">Add</button>
      </form>
      <button
        onClick={() => {
          const mrp = +(mrpInput.current as HTMLInputElement).value;
          const result = updateOption(mrp, data as ISelectedVariant, stocks);
          if (result) setStocks([]);
        }}
        type="button"
      >
        Update Option
      </button>
    </div>
  );
};

export default memo(OptionInfo);
