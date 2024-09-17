import React, { FC, memo } from "react";
import styles from "./drafts.module.css";
import { IDraftsProps } from "./interface";

const Drafts: FC<IDraftsProps> = ({
  drafts,
  draftSaveFun,
  deleteDraftFunc,
  selectDraftData,
}) => {
  const numOfDrafts = drafts.length;
  return (
    <>
      <div className={styles.top}>
        <button onClick={draftSaveFun} type="button">
          Add To Draft
        </button>
        <p>{numOfDrafts}</p>
      </div>
      {drafts.map(({ id, update, data, time }) => (
        <div className={styles.draft} key={id}>
          <p>{data.name}</p>
          <div>
            Update:
            <p>{update}</p>
            <span>{time}</span>
          </div>
          <button onClick={() => selectDraftData(id)}>Select</button>
          <button onClick={() => deleteDraftFunc(id)} style={{ color: "red" }}>
            Delete
          </button>
        </div>
      ))}
    </>
  );
};

export default memo(Drafts);
