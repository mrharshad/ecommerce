import { SignOptions } from "jsonwebtoken";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const expires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

export const locationCookie = {
  name: "location",
  expires,
} as ResponseCookie;

export const authCookie = {
  name: "token",
  expires,
  httpOnly: true,
  path: "/",
} as ResponseCookie;

export const emailVerifyJWTOpt: SignOptions = {
  expiresIn: "15m",
  algorithm: "HS256",
};

export const authJWTOpt: SignOptions = { expiresIn: "24h", algorithm: "HS256" };
