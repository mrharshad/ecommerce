import { FC, memo, useCallback } from "react";
import styles from "./handler.module.css";
import Drafts from "./Drafts";

import PreHandler from "../previews/Handler";
import { IProps } from "./interface";
import { useDispatch } from "react-redux";
import { deleteDraft, draftSave, getDrafts } from "@/app/redux/ProManagerSlice";
const SideBar: FC<IProps> = ({ data, drafts = [] }) => {
  const dispatch = useDispatch();
  const draftSaveFun = useCallback(() => {
    dispatch(draftSave("createProduct"));
  }, [dispatch]);
  const deleteDraftFunc = useCallback(
    (id: number) => {
      dispatch(deleteDraft(id));
    },
    [dispatch]
  );
  const selectDraftData = useCallback(
    (id: number) => {
      dispatch(getDrafts(id));
    },
    [dispatch]
  );

  return (
    <>
      <input
        type="checkbox"
        name="toggleInput"
        id="toggleInput"
        className={styles.toggleInput}
      />
      <label className={styles.toggleBtn} htmlFor="toggleInput"></label>
      <label className={styles.dropBox} htmlFor="toggleInput"></label>
      <div className={styles.sideBar}>
        <Drafts
          deleteDraftFunc={deleteDraftFunc}
          selectDraftData={selectDraftData}
          draftSaveFun={draftSaveFun}
          drafts={drafts}
        />
        <PreHandler data={data} />
      </div>
    </>
  );
};
export default memo(SideBar);
