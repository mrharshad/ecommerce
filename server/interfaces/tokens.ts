import { TRoles } from "@/server/interfaces/user";

export interface IEmailVerify {
  token: string;
  email: string;
}

export interface IAuthJwtInfo {
  _id: number;
  email: string;
  mobileNo: number;
  role: TRoles[];
}
