import { IAdditional, ICommonData, ISecureData } from "../interfaces/user";

interface ICommonProjection extends IAdditional, ISecureData {}

export const commonData: Record<keyof ICommonProjection, 0> = Object.freeze({
  password: 0,
  verification: 0,
  delivered: 0,
  canceled: 0,
  coupons: 0,
  createdAt: 0,
});

interface IWithSecureDataProjection extends IAdditional {}
export interface IWithSecureData extends ICommonData, ISecureData {}
export const withSecureData: Record<keyof IWithSecureDataProjection, 0> =
  Object.freeze({
    delivered: 0,
    canceled: 0,
    coupons: 0,
    createdAt: 0,
  });
