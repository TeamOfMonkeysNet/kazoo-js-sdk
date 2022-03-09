import fetch from "cross-fetch";
import md5 from "md5";
import { isTokenInvalid, parseResponse } from "../sdk/utils";
import { AuthInformation, RequestOptions } from "../types/auth.types";
import { ClientConfig } from "../types/config.types";
import { auth$ } from "./auth";

const createAuthRequest = (
  config: ClientConfig,
  credentials: string,
  accountName: string
) => {
  if (!config.host) {
    throw new Error("You have not specified an API host");
  }
  
  return new Promise((resolve, reject) =>
    fetch(`${config.host}/${config.authEndpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          credentials,
          account_name: accountName,
        },
      }),
    })
      .then(parseResponse)
      .then((response) => {
        if (response.ok) {
          resolve(response.json);
        }
        reject(response.json);
      })
      .catch(reject)
  );
};

const getCredentials = (username: string | null, password: string | null) =>
  md5(`${username}:${password}`).toString();

export class ApiService {
  config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  authenticate(
    username: string | null,
    password: string | null,
    accountName: string,
    credentials?: string
  ) {
    const { config } = this;
    const authCredentials = credentials || getCredentials(username, password);
    const authPromise = createAuthRequest(config, authCredentials, accountName);

    authPromise
      .then((response: any) => {
        const credentials = {
          authToken: response.auth_token,
          credentials: authCredentials,
          accountId: response.data.account_id,
          currentAccountId: response.data.account_id,
          accountName: accountName,
          currentAccountName: accountName,
          userId: response.data.owner_id,
        };

        auth$.next({ ...credentials });
      })
      .catch((error) => {
        console.error(
          "KazooSDK: There has been an error while authenticating",
          error
        );
      });
    return authPromise;
  }

  signOut() {
    auth$.next({
      authToken: null,
      userId: null,
      credentials: null,
      accountId: null,
      accountName: null,
      currentAccountId: null,
      currentAccountName: null,
    });
  }

  sendRequest(
    url: string,
    method: string,
    body: object | null = null,
  ) {
    const { config } = this;

    const requestPromise = new Promise((resolve, reject) => {
      const credentials = auth$.getValue();

      const request = (credentials: AuthInformation) => {
        const { authToken } = credentials;

        if (!authToken) {
          reject("User has not been authorized");
        }

        const headers = {
          "X-Auth-Token": authToken,
          "Content-Type": "application/json",
        } as HeadersInit;

        const requestBody = {
          ...(body && { data: body }),
        };
        const shouldSendBody = Object.keys(requestBody).length;

        fetch(config.host + url, {
          method,
          headers,
          ...(shouldSendBody && {
            body: JSON.stringify({ data: requestBody }),
          }),
        })
          .then(parseResponse)
          .then((response) => {
            if (response.ok) {
              resolve(response.json);
            }

            reject(response.json);
          })
          .catch(reject);
      };

      if (isTokenInvalid(credentials.authToken || "")) {
        return this.authenticate(
          "",
          "",
          credentials.accountName || "",
          credentials.credentials || ""
        )
          .then(() => request(auth$.getValue()))
          .catch(reject);
      }

      return request(credentials);
    });

    return requestPromise;
  }
}
