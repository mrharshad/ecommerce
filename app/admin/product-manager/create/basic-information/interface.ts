import { ChangeEvent, MouseEvent } from "react";

import { IExInfo, IExInfoData, INewProUpdate } from "../interface";
import { IAlert } from "@/interfaces/userClientSide";

export interface IProductNameProps {
  name: string;
  newProKeyFunc: (obj: INewProUpdate[]) => void;
}
export type IOptionNames = "tOfP" | "category" | "brand";

export interface IOptionsProps {
  data: string[];
  selectOption: (e: MouseEvent<HTMLButtonElement>) => void;
  selected: string;
  name: IOptionNames;
  heading: string;
}

export interface ISelectOption {
  name: IOptionNames;
  value: string;
}

export interface IDescriptionProps {
  description: string;
  newProKeyFunc: (obj: INewProUpdate[]) => void;
}
export interface IExInfosProps {
  exInfo: IExInfo[];
  newProKeyFunc: (obj: INewProUpdate[]) => void;
  showAlert: (obj: IAlert) => void;
  capitalize: (str: string) => string;
}
