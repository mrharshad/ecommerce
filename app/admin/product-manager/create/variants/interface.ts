import { MutableRefObject } from "react";
import { INewProUpdate, IVariant } from "../interface";

export interface ISelected {
  variant: string;
  imgSets: Array<string>;
  info: string;
}
export interface ICreatedVariantsProps {
  newProKeyFunc: (objects: INewProUpdate[]) => void;
  variants: IVariant[];
  selectedVariant: string;
  setSelected: (obj: ISelected) => void;
  createBtn: MutableRefObject<HTMLButtonElement | null>;
}
