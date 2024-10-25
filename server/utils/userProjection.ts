import { IUnAuthentication } from "@/server/interfaces/user";

export const authentication: Record<keyof IUnAuthentication, 0> = Object.freeze(
  { delivered: 0, canceled: 0 }
);
