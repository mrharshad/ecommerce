import { useDispatch, useSelector } from "react-redux";
import style from "./handler.module.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppDispatch, IReduxStoreData } from "@/app/redux/ReduxStore";
import {
  IDiscounts,
  IMainKeyChange,
  IReduxCreateData,
  IVariant,
} from "../interface";
import VariantInfo from "./VariantInfo";
import {
  mainKeyChange,
  newAlert,
  newProDoc,
  updateSingleVariant,
} from "@/app/redux/ProManagerSlice";

import OptionInfo from "./OptionInfo";
import { IAlert, IReduxUser } from "@/interfaces/userClientSide";
import { ISelectedVariant, IStocks, TData } from "./interface";
import { createProduct } from "../apiRequest";

const PriceAndStock = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, proManager } = useSelector((data: IReduxStoreData) => data);
  const { newData, listOfLocation, location, incomplete } = proManager;
  const { token } = user;
  const [data, setData] = useState<TData>(null);
  const { imageSets, variants } = newData;
  const updatePurchasedFunc = useCallback(
    (value: number, obj: IVariant) => {
      const { _id, discounts } = obj;
      if (value <= 1) {
        return dispatch(
          newAlert({
            type: "Message",
            text: "Check Purchased Discount",
          })
        );
      }
      if (discounts.some((dis) => dis.discount >= value)) {
        return dispatch(
          newAlert({
            type: "Message",
            text: "You cannot sell a product at a price lower than the price at which you bought it",
          })
        );
      }
      dispatch(
        updateSingleVariant({ _id, newData: { ...obj, purchased: value } })
      );
    },
    [dispatch]
  );

  const createUpdateDisOptFunc = useCallback(
    (min: number, discount: number, obj: IVariant): boolean => {
      if (min < 1 || discount < 0) {
        dispatch(newAlert({ type: "Message", text: "Check input values" }));
        return false;
      }

      const { _id, discounts, purchased } = obj;
      if (discounts.length > 4) {
        dispatch(
          newAlert({
            type: "Message",
            text: "Cannot create more than 5 discount options",
          })
        );
        return false;
      }

      if (discount >= purchased) {
        dispatch(
          newAlert({
            type: "Message",
            text: "You cannot sell a product at a price lower than the price at which you bought it",
          })
        );
        return false;
      }

      const newDiscounts: Array<IDiscounts> = [];
      if (discounts.some((obj) => obj.min < min && obj.discount > discount)) {
        dispatch(
          newAlert({
            type: "Message",
            text: "You may not have calculated your discount correctly",
          })
        );
        return false;
      }

      const newDis = { min, discount };
      const findIndex = discounts.findIndex(
        (obj) => obj.discount == discount || obj.min == min
      );
      if (findIndex >= 0) {
        newDiscounts.push(
          ...discounts.map((obj, index) => {
            if (findIndex == index) {
              return newDis;
            } else {
              return obj;
            }
          })
        );
      } else {
        newDiscounts.push(...discounts.concat(newDis));
      }
      dispatch(
        updateSingleVariant({
          _id,
          newData: {
            ...obj,
            discounts: newDiscounts.sort((a, b) => a.discount - b.discount),
          },
        })
      );
      return true;
    },
    [dispatch]
  );
  const removeDisOpt = useCallback(
    (discount: number, obj: IVariant) => {
      const { _id, discounts } = obj;
      dispatch(
        updateSingleVariant({
          _id,
          newData: {
            ...obj,
            discounts: discounts.filter((opt) => opt.discount !== discount),
          },
        })
      );
    },
    [dispatch]
  );
  const setOptionDataFunc = useCallback((data: ISelectedVariant) => {
    setData((pre) => {
      if (pre) {
        const { optionId, _id } = data;
        if (pre.optionId === optionId && pre._id === _id) {
          return null;
        }
        return data;
      } else return data;
    });
  }, []);
  const mainKeyChangeFunc = useCallback(
    (obj: IMainKeyChange) => {
      dispatch(mainKeyChange(obj));
    },
    [dispatch]
  );
  const newAlertFunc = useCallback(
    (obj: IAlert) => {
      dispatch(newAlert(obj));
    },
    [dispatch]
  );

  const updateOption = useCallback(
    (mrp: number, variant: ISelectedVariant, updatedStocks: IStocks[]) => {
      if (mrp < 10) {
        dispatch(
          newAlert({
            type: "Message",
            text: "Products with MRP less than Rs 29 cannot be sold",
          })
        );
        return false;
      }
      const { _id, optionId, options } = variant;

      console.log("updatedStocks", updatedStocks);
      const loc: Array<string> = [];
      for (let { state, districts } of updatedStocks) {
        for (let { name, stock } of districts) {
          loc.push(`${state}:${name}:${stock}`);
        }
      }
      console.log("loc", loc);
      const newOptions = options.map((obj) => {
        if (obj._id === optionId) {
          return { _id: optionId, mrp, loc };
        } else {
          return obj;
        }
      });

      dispatch(
        updateSingleVariant({
          _id,
          newData: {
            ...variant,
            options: newOptions,
          },
        })
      );
      setData(null);
      return true;
    },
    [dispatch]
  );
  const createFunc = async () => {
    const findUnused = imageSets.find(
      ({ _id }) =>
        !variants.some(({ options }) => options.some((obj) => obj._id === _id))
    );
    if (findUnused) {
      return newAlertFunc({
        type: "Message",
        text: `The ${findUnused._id} image set is not being used please remove it or use this`,
        duration: "5s",
      });
    }

    dispatch(createProduct({ ...newData, token }));
  };

  useEffect(() => {
    for (let { discounts, options, purchased } of variants) {
      if (
        discounts.length &&
        purchased &&
        options.length &&
        options.every(({ loc }) => loc.length)
      ) {
        dispatch(mainKeyChange({ name: "incomplete", value: 5 }));
      } else {
        dispatch(mainKeyChange({ name: "incomplete", value: 4 }));
      }
    }
  }, [dispatch, variants]);

  return (
    <div className={style.container}>
      <div className={style.variantsInfo}>
        {variants.map((obj) => (
          <VariantInfo
            key={obj._id}
            variant={obj}
            imageSets={imageSets}
            updatePurchased={updatePurchasedFunc}
            createUpdateDisOpt={createUpdateDisOptFunc}
            removeDisOpt={removeDisOpt}
            setOptionDataFunc={setOptionDataFunc}
          />
        ))}
      </div>
      <OptionInfo
        data={data}
        setData={setData}
        listOfLocation={listOfLocation}
        location={location}
        mainKeyChangeFunc={mainKeyChangeFunc}
        newAlertFunc={newAlertFunc}
        updateOption={updateOption}
      />
      <button
        onClick={createFunc}
        style={{ display: incomplete == 5 ? "unset" : "none" }}
        type="button"
      >
        Create Product
      </button>
    </div>
  );
};

export default PriceAndStock;
