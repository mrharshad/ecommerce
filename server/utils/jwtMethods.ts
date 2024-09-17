import { verify } from "jsonwebtoken";
import config from "../config/config";
import { IJwtTokenValue, TRoles } from "@/interfaces/userServerSide";
const { jwtSecretCode } = config;

function getJwtInfo(token: string | null) {
  if (token) {
    try {
      return verify(token, jwtSecretCode) as IJwtTokenValue;
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

function verifyRole(token: string | null, roleType: TRoles) {
  if (token) {
    try {
      const decoded = verify(token, jwtSecretCode) as IJwtTokenValue;
      return decoded.role.includes(roleType);
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export { getJwtInfo, verifyRole };
