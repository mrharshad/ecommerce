import { IAuthentication, IAuthorizedUser } from "@/interfaces/userServerSide";

export const authentication: Record<keyof IAuthentication, 1> = {
  _id: 1,
  email: 1,
  fName: 1,
  lName: 1,
  gender: 1,
  password: 1,
  location: 1,
  bDate: 1,
  bMonth: 1,
  bYear: 1,
  cartPro: 1,
  nOfNOrder: 1,
  searches: 1,
  tokens: 1,
  role: 1,
};

export const authorizedUser: Record<keyof IAuthorizedUser, 1> = {
  _id: 1,
  email: 1,
  fName: 1,
  lName: 1,
  gender: 1,
  location: 1,
  bDate: 1,
  bMonth: 1,
  bYear: 1,
  cartPro: 1,
  nOfNOrder: 1,
  searches: 1,
};
