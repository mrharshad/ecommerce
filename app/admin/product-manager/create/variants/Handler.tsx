import React, {
  ChangeEvent,
  FC,
  useCallback,
  useRef,
  useState,
  FormEvent,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./handler.module.css";
import { AppDispatch } from "@/app/redux/ReduxStore";
import { INewProUpdate, IReduxCreateData } from "../interface";
import {
  mainKeyChange,
  newAlert,
  newProUpdate,
} from "@/app/redux/ProManagerSlice";
import Image from "next/image";
import CreatedVariants from "./CreatedVariants";
import { ISelected } from "./interface";
import { IAlert } from "@/app/interfaces/user";
const Variants: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const emptySelected = {
    variant: "",
    imgSets: [],
    info: "",
  };
  const [selected, setSelected] = useState<ISelected>(emptySelected);
  const { variant, info } = selected;
  const createBtn = useRef<null | HTMLButtonElement>(null);
  const { newData } = useSelector((data: IReduxCreateData) => data.proManager);
  const variantKeySetBtn = useRef<null | HTMLButtonElement>(null);
  const variantName = useRef<null | HTMLInputElement>(null);
  const variantDescription = useRef<null | HTMLTextAreaElement>(null);
  const { variantKey, variants, imageSets } = newData || {};
  const showAlert = useCallback(
    (obj: IAlert) => {
      dispatch(newAlert(obj));
    },
    [dispatch]
  );
  const changeVariantKey = (event: ChangeEvent<HTMLInputElement>) => {
    const btn = variantKeySetBtn.current?.style;
    const value = event.target.value.trim();
    if (btn) {
      if (!value && variants.length > 1) {
        btn.display = "none";
        event.target.value = variantKey as string;
        return showAlert({
          type: "Message",
          text: "The difference can only be removed if there is only one variant of the product",
        });
      }
      if (value === variantKey || (!value && !variantKey)) {
        btn.display = "none";
      } else {
        btn.display = "unset";
      }
    }
  };
  const newProKeyFunc = useCallback(
    (objects: INewProUpdate[]) => {
      dispatch(newProUpdate(objects));
    },
    [dispatch]
  );

  const updateVariantKey = (formData: FormData) => {
    const value = (formData.get("variantKey") as string).trim();
    const btn = variantKeySetBtn.current?.style;
    if (btn) btn.display = "none";

    newProKeyFunc([{ name: "variantKey", value }]);
  };
  const selectedImgSetFunc = (_id: string) => {
    const btn = createBtn.current?.style;
    if (btn && btn) if (variant) btn.display = "unset";
    setSelected(({ variant, imgSets, info }) => {
      const newObj = { variant, info } as ISelected;
      if (imgSets.includes(_id)) {
        newObj.imgSets = imgSets.filter((data) => data !== _id);
      } else {
        newObj.imgSets = [...imgSets, _id];
      }
      return newObj;
    });
  };

  const changeNewVariantKey = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim().toLowerCase();
    const btn = createBtn.current?.style;
    if (btn) {
      const findVariant = variants.find(
        (obj) => obj._id.toLowerCase() == value
      );
      if (findVariant) {
        const { _id, info, options } = findVariant;
        setSelected({
          variant: _id,
          info,
          imgSets: options.map((opt) => opt._id),
        });
      } else if (selected.variant) {
        setSelected(emptySelected);
      }

      if (!value || value.length > 16) {
        btn.display = "none";
      } else {
        btn.display = "unset";
      }
    }
  };

  const manageVariant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = variantName.current;
    const description = variantDescription.current;
    const { variant, imgSets } = selected;
    const value = variant || (input?.value as string).trim();
    const info = (description?.value as string).trim();
    const numOfVariants = variants.length;
    const newVariants = [...variants];
    const numOfImgSets = imgSets.length;
    const selectedImgSets = numOfImgSets
      ? imgSets
      : imageSets.map((obj) => obj._id);
    const toLowerCaseValue = value.toLowerCase();
    const findIndex = variants.findIndex(
      (obj) => obj._id.toLowerCase() === toLowerCaseValue
    );
    if (findIndex >= 0) {
      const data = variants[findIndex];
      let newOption = [...data.options];
      for (let _id of selectedImgSets) {
        if (newOption.some((obj) => obj._id === _id)) continue;

        newOption.push({ _id, loc: [], mrp: 0 });
      }
      const removePending: Array<number> = [];

      newOption.forEach((obj, index) => {
        if (!selectedImgSets.includes(obj._id)) {
          removePending.push(index);
        }
      });
      newOption = newOption.filter(
        (obj, index) => !removePending.includes(index)
      );

      newVariants[findIndex] = {
        ...data,
        info,
        options: newOption,
      };
    } else if (numOfVariants && !variantKey) {
      return showAlert({
        type: "Message",
        text: "And before creating variants, enter the differences in the variants at the top",
      });
    } else {
      newVariants.push({
        _id: value,
        purchased: 0,
        info,
        discounts: [],
        options: selectedImgSets.map((_id) => {
          return { _id, loc: [], mrp: 0 };
        }),
      });
    }
    const btn = createBtn.current?.style;
    if (btn) btn.display = "none";
    setSelected(emptySelected);
    if (input && description) {
      input.value = "";
      description.value = "";
    }
    newProKeyFunc([{ name: "variants", value: newVariants }]);
  };

  useEffect(() => {
    const numOfVariants = variants.length;
    if (numOfVariants) {
      if (numOfVariants > 1 && !variantKey) null;
      else {
        dispatch(mainKeyChange({ name: "incomplete", value: 4 }));
      }
    }
  }, [dispatch, variantKey, variants]);

  return (
    <>
      <form action={updateVariantKey} className={style.updateVariantKey}>
        <label htmlFor="variantKey">Difference :</label>
        <input
          defaultValue={variantKey}
          maxLength={15}
          type="text"
          placeholder="height, width, size, and much more..."
          onChange={changeVariantKey}
          name="variantKey"
          id="variantKey"
        />
        <button ref={variantKeySetBtn} type="submit">
          Update
        </button>
      </form>

      <div className={style.createdVariants}>
        <CreatedVariants
          variants={variants}
          newProKeyFunc={newProKeyFunc}
          selectedVariant={variant}
          setSelected={setSelected}
          createBtn={createBtn}
        />
      </div>
      <div className={style.createdColors}>
        {imageSets.map(({ _id, images }) => (
          <div
            key={_id}
            style={{
              borderColor: selected.imgSets.includes(_id) ? "#0cff0c" : "white",
            }}
            className={style.color}
          >
            <Image
              onClick={() => selectedImgSetFunc(_id)}
              width={300}
              height={200}
              src={images[0]}
              alt={"create color"}
            />
            <p>{_id}</p>
          </div>
        ))}
      </div>

      <form onSubmit={manageVariant} className={style.newVariant}>
        <label htmlFor="variantInfo">
          Variant Description {"(Optional)"} :
        </label>
        <textarea
          ref={variantDescription}
          placeholder="Write a description..."
          maxLength={200}
          name="variantInfo"
          id="variantInfo"
          defaultValue={info}
          key={info || 1}
          onChange={(event) => {
            const value = event.target.value.trim();
            const btn = createBtn.current?.style;
            if (variant && btn) {
              if (info !== value) {
                btn.display = "unset";
              } else {
                btn.display = "none";
              }
            }
          }}
        />
        <label htmlFor="newVariant">
          Enter any type of key in the variant :
        </label>
        <input
          ref={variantName}
          onChange={changeNewVariantKey}
          name="newVariant"
          id="newVariant"
          type="text"
          placeholder="1 inch, 5 feet, 18 mm, and much more..."
          maxLength={15}
          minLength={2}
          defaultValue={variant}
          key={variant}
          required
        />

        <button ref={createBtn} type="submit">
          {variant ? "Update" : "Create"}
        </button>
      </form>
    </>
  );
};

export default Variants;
