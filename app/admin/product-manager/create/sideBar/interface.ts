import { IDraft, INewData } from "../interface";

export interface IProps {
  drafts: IDraft[];
  data: INewData;
}
export interface IDraftsProps {
  draftSaveFun: () => void;
  drafts: IDraft[];
  deleteDraftFunc: (id: number) => void;
  selectDraftData: (id: number) => void;
}
