import React, { FC } from "react";

import style from "./Header.module.css";
import { IToggleSuggestion } from "@/interfaces/userClientSide";
interface IProps {
  toggleSuggestion: IToggleSuggestion;
  searchFunc: (key: string) => void;
  deleteSearchKeys: (key: string) => void;
}
const Suggestions: FC<IProps> = ({ toggleSuggestion }) => {
  console.log("suggestions rerender");
  return (
    <div style={{ maxHeight: toggleSuggestion }} className={style.searchKeys}>
      {(searchKeys.length > 0 && !numOfFiltered
        ? searchKeys
        : filteredSearch
      ).map((key, index) => {
        const name = key.name || key;
        return (
          <div key={index}>
            {numOfFiltered ? (
              <svg>
                <path fill="none" d="M0 0h24v24H0V0z"></path>
                <path
                  d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fil="#000000"
                ></path>
              </svg>
            ) : null}
            <p onClick={() => searchFunc(key)}>{name}</p>
            {numOfFiltered ? null : (
              <svg onClick={() => deleteSearchKeys(name)} id="Close">
                <path
                  d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
                  fill="#FF0000"
                ></path>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Suggestions;
