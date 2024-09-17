"use client";
import { ChangeEvent, FC, FormEvent, memo, MouseEvent, useState } from "react";
import style from "./options.module.css";
import { IOptionsProps } from "./interface";

const Options: FC<IOptionsProps> = ({
  data,
  name,
  selected,
  heading,
  selectOption,
}) => {
  const [filtered, setFiltered] = useState<null | string[]>(null);
  if (!data) {
    return null;
  }
  const changeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.toLocaleLowerCase();
    const filtered = data.filter((name) =>
      name.toLocaleLowerCase().includes(key)
    );
    setFiltered(filtered.length ? filtered : null);
  };
  return (
    <div className={style.mainDiv}>
      <p>{heading}</p>
      {selected ? (
        <span>{selected}</span>
      ) : (
        <input
          onChange={changeInput}
          type="text"
          maxLength={30}
          name={name}
          placeholder={`Search ${heading}...`}
        />
      )}
      {selected ? (
        <button
          className={style.cancelOpt}
          type="button"
          name={name}
          value=""
          onClick={selectOption}
        >
          Clear
        </button>
      ) : null}

      <input className={style.toggleInput} type="checkbox" id={name} />
      {selected ? null : (
        <div className={style.options}>
          {(filtered || data).map((opt) => (
            <button
              type="button"
              key={opt}
              name={name}
              value={opt}
              onClick={selectOption}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(Options);
