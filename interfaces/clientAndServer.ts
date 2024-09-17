export interface IServerResponse {
  success: boolean;
  status: number;
  message: string;
}

export interface ICustomError extends Error {
  name: string;
  code: number;
  path: string;
  type: string;
}
