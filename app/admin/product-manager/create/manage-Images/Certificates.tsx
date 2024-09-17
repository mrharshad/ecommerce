import React, {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useRef,
  useState,
} from "react";
import { ICertificatesProps } from "./interface";
import { AppDispatch } from "@/app/redux/ReduxStore";
import { useDispatch } from "react-redux";
import Image from "next/image";
import style from "./certificates.module.css";
const Certificates: FC<ICertificatesProps> = ({
  certificates,
  newProKeyFunc,
  showAlert,
  loadImage,
  deleteCertificate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [keyName, setKeyName] = useState<string>("");

  const selectedImages = useCallback(
    async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
      try {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) {
          throw new Error("Select an image again");
        }
        const selectedImg = files[0];
        if (selectedImg.size > 409600) {
          throw new Error(`greater than 400kb: ${selectedImg.name}`);
        }

        const image = await loadImage(selectedImg);
        const existImage = certificates.find((obj) => obj.image === image);
        if (existImage) {
          throw new Error("The image already exists in a certificate");
        }
        const newData = Array.from(certificates);
        const lowerCaseName = keyName.toLowerCase();
        const index = certificates.findIndex(
          (obj) => obj.name.toLowerCase() === lowerCaseName
        );

        const certificate = { name: keyName, image };
        if (index !== -1) {
          newData[index] = certificate;
        } else {
          newData.push(certificate);
        }
        newProKeyFunc([{ name: "certificates", value: newData }]);
        setKeyName("");
      } catch (err) {
        setKeyName("");
        if (err instanceof Error)
          showAlert({
            text: err.message,
            type: "Error",
          });
      }
    },
    [keyName, newProKeyFunc, showAlert, certificates, loadImage]
  );
  const enterName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setKeyName(value);
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h3>Certificates :</h3>
        <input
          onChange={enterName}
          defaultValue={keyName}
          id="certificateName"
          type="text"
          placeholder="enter name..."
          key={keyName ? 1 : 2}
        />
        {keyName && (
          <>
            <label htmlFor="certificateImage">Select</label>
            <input
              key={keyName}
              onChange={selectedImages}
              name="certificateImage"
              id="certificateImage"
              type="file"
              accept="image/*"
            />
          </>
        )}
      </div>
      {certificates.map(({ name, image }) => {
        return (
          <div className={style.certificate} key={name}>
            <p
              onClick={() => {
                setKeyName("");
                setTimeout(() => {
                  setKeyName(name);
                }, 0);
              }}
            >
              {name}
            </p>
            {image ? (
              <Image width={300} height={200} alt="certificate" src={image} />
            ) : (
              <span onClick={() => setKeyName(name)}>Select Name</span>
            )}
            <button onClick={() => deleteCertificate(name)} type="button">
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default memo(Certificates);
