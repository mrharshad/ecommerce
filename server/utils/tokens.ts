import { msADay } from "@/exConfig";
import { SignOptions } from "jsonwebtoken";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const expires = Date.now() + 1 * msADay;

export const locationCookie = {
  name: "location",
  expires,
  httpOnly: true,
  path: "/",
} as ResponseCookie;

export const authCookie = {
  name: "token",
  expires,
  httpOnly: true,
  path: "/",
} as ResponseCookie;

export const orderDocsCookie = {
  name: "orderDocs",
  expires,
  httpOnly: true,
  path: "/",
} as ResponseCookie;

export const emailVerifyJWTOpt: SignOptions = {
  expiresIn: "15m",
  algorithm: "HS256",
};

export const authJWTOpt: SignOptions = { expiresIn: "24h", algorithm: "HS256" };
