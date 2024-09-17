import { IAlert } from "../../interfaces/userClientSide";

export interface IGetDistricts {
  success: boolean;
  resState: string;
  resData: string[];
  resAlert?: IAlert;
}
