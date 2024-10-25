import React, {
  ChangeEvent,
  FC,
  useEffect,
  useMemo,
  MouseEvent,
  useCallback,
  useRef,
} from "react";
import style from "./handler.module.css";
import { ISelectOption } from "./interface";
import { useDispatch, useSelector } from "react-redux";
import {
  ICategoryData,
  INewProUpdate,
  IReduxCreateData,
  TProcesses,
} from "../interface";
import ProductName from "./ProductName";
import Options from "./Options";

import { AppDispatch } from "@/app/redux/ReduxStore";

import { fetchCategory } from "../apiRequest";
import ExInfo from "./ExInfo";
import {
  mainKeyChange,
  newAlert,
  newProUpdate,
} from "@/app/redux/ProManagerSlice";
import { IAlert } from "@/app/interfaces/user";
const BasicInformation: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const showAlert = (obj: IAlert) => {
    dispatch(newAlert(obj));
  };
  const descriptionBtn = useRef<null | HTMLButtonElement>(null);
  const newProKeyFunc = useCallback(
    (obj: INewProUpdate[]) => {
      dispatch(newProUpdate(obj));
    },
    [dispatch]
  );
  const { newData, fetchedCategories, categories, incomplete, openedDraft } =
    useSelector((data: IReduxCreateData) => data.proManager);

  const descriptionUpdate = (fromData: FormData) => {
    const value = (fromData.get("description") as string).trim();
    if (value.length < 30) return;
    newProKeyFunc([{ name: "description", value }]);
    const btn = descriptionBtn.current?.style;
    if (btn) btn.display = "none";
  };

  const {
    name,
    tOfP,
    category,
    exInfo = [],
    description,
    brand,
  } = newData || {};
  const capitalize = useCallback((str: string) => {
    return str.replace(/\b\w/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  }, []);

  const selectOption = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const { name, value } = e.currentTarget as ISelectOption;
      if (name === "category") {
        const data = fetchedCategories.find((obj) => obj._id == value);
        if (value && !data) {
          dispatch(fetchCategory(value));
        }
        if (!value || data)
          newProKeyFunc([
            { name, value },
            { name: "brand", value: "" },
            { name: "tOfP", value: "" },
          ]);
      } else {
        newProKeyFunc([{ name, value }]);
      }
    },
    [dispatch]
  );

  const { brands, tOfProducts } = useMemo((): ICategoryData => {
    const obj = {} as ICategoryData;
    const data = fetchedCategories.find((obj) => obj._id == category);
    if (data) {
      obj.brands = data.brands;
      obj.tOfProducts = data.tOfProducts.map(({ tOfPName }) => tOfPName);
    }
    return obj;
  }, [category, fetchedCategories]);

  useEffect(() => {
    if (tOfP && incomplete == 1) {
      const data = fetchedCategories.find((obj) => obj._id == category);
      if (data) {
        const product = data.tOfProducts.find(
          (typeOfP) => typeOfP.tOfPName === tOfP
        );
        if (product)
          newProKeyFunc([{ name: "exInfo", value: product.exInfoData }]);
      }
    }
    if (!tOfP) {
      newProKeyFunc([{ name: "exInfo", value: [] }]);
    }
  }, [tOfP]);

  useEffect(() => {
    if (
      name &&
      category &&
      tOfP &&
      brand &&
      description.length > 20 &&
      exInfo.length > 3 &&
      exInfo.every((obj) => obj.value)
    ) {
      dispatch(mainKeyChange({ name: "incomplete", value: 2 }));
    }
  }, [dispatch, newData]);

  return (
    <>
      <ProductName
        key={`${name}:${openedDraft}`}
        newProKeyFunc={newProKeyFunc}
        name={name}
      />
      <Options
        data={categories}
        heading="Categories :"
        name="category"
        selected={category}
        selectOption={selectOption}
      />
      <Options
        data={brands || []}
        heading="Brand :"
        name="brand"
        selected={brand}
        selectOption={selectOption}
      />
      <Options
        data={tOfProducts || []}
        heading="Product :"
        name="tOfP"
        selected={tOfP}
        selectOption={selectOption}
      />
      <form action={descriptionUpdate} className={style.description}>
        <label htmlFor="description">Description :</label>
        <button ref={descriptionBtn} type="submit">
          Update
        </button>

        <textarea
          key={openedDraft}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            const btn = descriptionBtn.current?.style;
            if (event.target.value.trim().length > 30 && btn) {
              btn.display = "unset";
            } else {
              if (btn) btn.display = "none";
            }
          }}
          minLength={30}
          name="description"
          id="description"
          placeholder="Write a description..."
          defaultValue={description}
        />
      </form>
      <ExInfo
        key={openedDraft}
        showAlert={showAlert}
        newProKeyFunc={newProKeyFunc}
        exInfo={exInfo}
        capitalize={capitalize}
      />
    </>
  );
};

export default BasicInformation;
