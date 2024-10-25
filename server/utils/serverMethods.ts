import { verify } from "jsonwebtoken";
import config from "../config/config";
import { TRoles } from "@/server/interfaces/user";
import { IAuthJwtInfo } from "../interfaces/tokens";
const { jwtSecretCode } = config;
export interface IServerResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
}

const serverResponse = (
  success: boolean,
  message: string,
  status: number,
  data?: any
) => {
  return new Response(
    JSON.stringify({ success, message, data } as IServerResponse),
    {
      status,
    }
  );
};

function verifyRole(token: string | null, roleType: TRoles) {
  if (token) {
    try {
      const decoded = verify(token, jwtSecretCode) as IAuthJwtInfo;
      return decoded.role.includes(roleType);
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export { verifyRole, serverResponse };
