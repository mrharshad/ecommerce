import { ChangeEvent, FC, FormEvent, memo, useRef, useState } from "react";
import { IProductNameProps } from "./interface";
import style from "./ProductName.module.css";
const ProductName: FC<IProductNameProps> = ({ name, newProKeyFunc }) => {
  const [inputValue, setInputValue] = useState(name);
  const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setInputValue(value);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();

    newProKeyFunc([{ name: "name", value: inputValue }]);
  };
  return (
    <form className={style.container} onSubmit={submit}>
      <label htmlFor="name">Name :</label>
      {inputValue !== name && <button type="submit">Update</button>}
      <input
        defaultValue={name}
        className={style.nameInput}
        onChange={inputChange}
        name="name"
        id="name"
        type="text"
        placeholder="Product Name..."
        maxLength={75}
        minLength={10}
      />
    </form>
  );
};

export default memo(ProductName);
