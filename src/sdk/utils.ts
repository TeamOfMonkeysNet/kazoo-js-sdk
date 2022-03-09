import jwt from "jsonwebtoken";
import { ParsedResponse } from "../types/utils.types";

export const parseResponse = (response: Response) =>
  new Promise<ParsedResponse>((resolve) =>
    response.text().then((body) =>
      resolve({
        status: response.status,
        ok: response.ok,
        json: body !== "" ? JSON.parse(body) : "{}",
      })
    )
  );

export const isTokenInvalid = (token: string): boolean => {
  const currentTimestamp = Math.ceil(new Date().getTime() / 1000);

  try {
    var { exp: expiration = currentTimestamp } = jwt.decode(
      token
    ) as jwt.JwtPayload;
  } catch (error: unknown) {
    return true;
  }
  const expirationBuffer = 10;
  const expirationTimestamp = expiration - expirationBuffer;
  const isTokenExpiring = currentTimestamp >= expirationTimestamp;

  return isTokenExpiring;
};
