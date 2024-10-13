import React, {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useRef,
  useState,
} from "react";
import { INewSet } from "./interface";
import style from "./newSet.module.css";
import Image from "next/image";
import { imageSetImages } from "../../config";

const NewSet: FC<INewSet> = ({
  imageSets,
  showAlert,
  newProKeyFunc,
  uniqueSelectedImages,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const difference = useRef<HTMLInputElement | null>(null);

  const totalSelected = images.length;

  const selectedImages = useCallback(
    async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) {
        return;
      }
      let selectedImg = await uniqueSelectedImages(files);
      const allImg: string[] = [];
      allImg.push(...images);
      imageSets.forEach((set) => {
        allImg.push(...set.images);
      });
      selectedImg = selectedImg.filter((newImg) => {
        if (!allImg.includes(newImg)) {
          return newImg;
        }
      });

      setImages((old) => [...old, ...selectedImg]);
    },
    [imageSets, images, uniqueSelectedImages]
  );
  const createImgSet = () => {
    const diffElement = difference.current as HTMLInputElement;

    const _id = diffElement.value.trim();
    if (totalSelected > imageSetImages || totalSelected < 1 || _id.length < 1) {
      return showAlert({
        text: "Please check images quantity & difference",
        type: "Message",
      });
    }
    const lowerCaseId = _id.toLowerCase();
    if (imageSets.some((obj) => obj._id.toLowerCase() === lowerCaseId)) {
      return showAlert({
        text: `${_id}: image set is already created`,
        type: "Message",
      });
    }

    const newImagSets = imageSets.concat({ _id, images });

    newProKeyFunc([{ name: "imageSets", value: newImagSets }]);

    diffElement.value = "";
    setImages([]);
  };
  const selectedImageDelete = (setIndex: number) => {
    setImages((previous) =>
      previous.filter((data, index) => setIndex !== index)
    );
  };
  return (
    <div className={style.container}>
      <p>Create Image Set :</p>
      <label className={style.selectImgBtn} htmlFor="images">
        Select Images
      </label>
      <input
        className={style.selectImgInput}
        onChange={selectedImages}
        name="images"
        id="images"
        type="file"
        accept="image/*"
        multiple
      />
      <label className={style.diffLabel}>
        Enter any type of key in the image set:
      </label>
      <input
        className={style.diffInput}
        ref={difference}
        maxLength={15}
        type="text"
        placeholder="green, modern, steel much more... "
      />

      <div className={style.selectedImg}>
        {images.map((img, index) => (
          <div key={index}>
            <svg onClick={() => selectedImageDelete(index)}>
              <path
                fill="#FF0000"
                d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
              ></path>
              <path
                fill="#FF0000"
                d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
              ></path>
            </svg>
            <Image
              className={style.img}
              key={index}
              alt="product img"
              width={300}
              height={200}
              src={img}
            />
          </div>
        ))}
      </div>

      <button
        style={{
          display: totalSelected > 0 ? "inline-block" : "none",
        }}
        onClick={createImgSet}
        type="button"
      >
        Add Images
      </button>
    </div>
  );
};

export default memo(NewSet);
