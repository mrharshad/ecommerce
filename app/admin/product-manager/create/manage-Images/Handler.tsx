import { IAlert } from "@/interfaces/userClientSide";
import {
  mainKeyChange,
  newAlert,
  newProUpdate,
} from "@/app/redux/ProManagerSlice";
import { AppDispatch } from "@/app/redux/ReduxStore";
import React, {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ICertificates,
  IFetchCategory,
  IFetchedCategories,
  INewProUpdate,
  IReduxCreateData,
  IVariant,
} from "../interface";
import style from "./handler.module.css";
import NewSet from "./NewSet";

import Image from "next/image";
import Certificates from "./Certificates";

const ManageImages: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const newProKeyFunc = useCallback(
    (objects: INewProUpdate[]) => {
      dispatch(newProUpdate(objects));
    },
    [dispatch]
  );

  const thumbnailImg = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = Array.from(e.target.files || []);
      file.forEach((img, index) => {
        if (img.size > 409600) {
          return dispatch(
            newAlert({
              text: `greater than 400kb: ${img.name}`,
              type: "Message",
            })
          );
        }
      });
      if (file.length === 0) {
        return dispatch(
          newAlert({ type: "Error", text: "Again or select another image" })
        );
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          newProKeyFunc([{ name: "thumbnail", value: reader.result }]);
        }
      };

      reader.readAsDataURL(file[0]);
    },
    [dispatch, newProKeyFunc]
  );

  const imgSetKeyBtn = useRef<HTMLButtonElement | null>(null);
  const showAlert = useCallback(
    (obj: IAlert) => {
      dispatch(newAlert(obj));
    },
    [dispatch]
  );
  const { newData, fetchedCategories, categories } = useSelector(
    (data: IReduxCreateData) => data.proManager
  );

  const {
    category,
    tOfP,
    imgSetKey,
    thumbnail,
    certificates,
    imageSets = [],
    variants,
  } = newData || {};
  const requireCertificate = useMemo(() => {
    const findCategory = fetchedCategories.find(
      (obj) => obj._id === category
    ) as IFetchedCategories;
    const data = findCategory.tOfProducts.find((obj) => obj.tOfPName == tOfP)
      ?.requiredCertificates as string[];
    return data;
  }, [tOfP, category, fetchedCategories]);
  const totalSets = imageSets.length;

  const updateSetKey = (formData: FormData) => {
    const value = (formData.get("imageSetKey") as string).trim();
    const btn = imgSetKeyBtn.current?.style;
    if (btn) btn.display = "none";

    newProKeyFunc([{ name: "imgSetKey", value }]);
  };
  const orderChange = (index: number, move: "left" | "right") => {
    let newData = [...imageSets];
    const siblingData =
      move === "left" ? imageSets[index - 1] : imageSets[index + 1];

    newData = newData.with(index, siblingData);

    const clickedData = imageSets[index];
    newData = newData.with(
      move === "right" ? index + 1 : index - 1,
      clickedData
    );
    newProKeyFunc([{ name: "imageSets", value: newData }]);
  };
  const deleteSet = (id: string) => {
    const proKeys: Array<INewProUpdate> = [
      {
        name: "imageSets",
        value: imageSets.filter((obj) => obj._id !== id),
      },
    ];
    const findVariant = variants.some((obj) =>
      obj.options.some((opt) => opt._id === id)
    );
    if (findVariant) {
      let newVariants: Array<IVariant> = [];
      variants.forEach((obj) => {
        let { options } = obj;
        if (options.some((opt) => opt._id === id)) {
          if (options.length > 1) {
            newVariants.push({
              ...obj,
              options: options.filter((obj) => obj._id !== id),
            });
          }
        } else {
          newVariants.push(obj);
        }
      });
      proKeys.push({ name: "variants", value: newVariants });
    }
    newProKeyFunc(proKeys);
  };
  const loadImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          resolve(reader.result as string);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);
  const uniqueSelectedImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      const validFiles = [];
      for (const img of files) {
        if (img.size <= 409600) {
          validFiles.push(img);
        } else {
          showAlert({
            text: `greater than 400kb: ${img.name}`,
            type: "Message",
          });
        }
      }

      const loadedImages: string[] = [];
      for (const file of validFiles) {
        try {
          const result = await loadImage(file);
          loadedImages.push(result);
        } catch (error) {
          continue;
        }
      }

      const uniqueValue = new Set(loadedImages);
      return Array.from(uniqueValue);
    },
    [showAlert, loadImage]
  );
  const deleteCertificate = useCallback(
    (name: string) => {
      const required = fetchedCategories.some(({ _id, tOfProducts }) => {
        if (_id == category) {
          return tOfProducts.some(({ requiredCertificates }) => {
            return requiredCertificates.some((key) => key === name);
          });
        }
      });
      if (required) {
        showAlert({
          type: "Message",
          text: `${name}: Certificate is Required`,
        });
      } else {
        newProKeyFunc([
          {
            name: "certificates",
            value: certificates.filter((obj) => obj.name !== name),
          },
        ]);
      }
    },
    [newProKeyFunc, category, fetchedCategories]
  );

  useEffect(() => {
    const requiredTotal = requireCertificate.length;
    if (requiredTotal && !certificates.some((obj) => obj.name)) {
      newProKeyFunc([
        {
          name: "certificates",
          value: requireCertificate.map((name) => {
            return { name, image: "" };
          }),
        },
      ]);
    }
  }, [newProKeyFunc, certificates, requireCertificate]);

  useEffect(() => {
    if (
      imageSets?.length &&
      certificates.every((obj) => obj.image) &&
      thumbnail
    ) {
      dispatch(mainKeyChange({ name: "incomplete", value: 3 }));
    }
  }, [dispatch, newData]);
  return (
    <>
      <div className={style.topContainer}>
        <div className={style.thumbnailContainer}>
          <span>Thumbnail {"(Required)"} :</span>
          <label className={style.thumbnailLabel} htmlFor="thumbnail">
            {thumbnail ? "Update" : "Chose"}
          </label>
          <input
            className={style.thumbnailInput}
            onChange={thumbnailImg}
            name="thumbnail"
            id="thumbnail"
            type="file"
            accept="image/*"
          />
        </div>
        <form action={updateSetKey} className={style.updateSetKey}>
          <label htmlFor="imageSetKey">Difference {"(Optional)"} :</label>
          <input
            defaultValue={imgSetKey}
            maxLength={15}
            type="text"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const btn = imgSetKeyBtn.current?.style;
              const value = event.target.value.trim();
              if (btn && value.length < 16 && value !== imgSetKey) {
                btn.display = "unset";
              } else {
                if (btn) btn.display = "none";
              }
            }}
            name="imageSetKey"
            id="imageSetKey"
            placeholder="colour, design, material much more..."
          />
          <button ref={imgSetKeyBtn} type="submit">
            Update
          </button>
        </form>
      </div>
      <div className={style.created}>
        <p>
          Created Sets : <span>Total: </span>[ {totalSets} ]
        </p>
        {imageSets.map(({ _id, images }, index) => {
          return (
            <div key={_id}>
              <div>
                {totalSets > 1 && index > 0 ? (
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
                {totalSets > 1 && totalSets > index + 1 ? (
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

                {totalSets > 1 ? (
                  <svg
                    className={style.deleteSvg}
                    onClick={() => deleteSet(_id)}
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
                ) : null}
              </div>
              <Image
                key={index}
                alt="product img"
                width={300}
                height={200}
                src={images[0]}
              />
              <p>{_id}</p>
            </div>
          );
        })}
      </div>
      <NewSet
        imageSets={imageSets}
        showAlert={showAlert}
        newProKeyFunc={newProKeyFunc}
        uniqueSelectedImages={uniqueSelectedImages}
      />
      <Certificates
        certificates={certificates}
        newProKeyFunc={newProKeyFunc}
        showAlert={showAlert}
        loadImage={loadImage}
        deleteCertificate={deleteCertificate}
      />
    </>
  );
};

export default memo(ManageImages);
