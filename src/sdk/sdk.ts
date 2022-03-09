import _ from "lodash";
import apiSpec from "../api.json";
import { ApiService } from "../rest/api";
import { auth$ } from "../rest/auth";
import { ClientConfig } from "../types/config.types";
import { SDKMethodData } from "../types/sdk.types";

export default class SDK {
  #api: ApiService;
  config: ClientConfig;
  Auth$: typeof auth$;
  resources: Record<string, () => Promise<unknown>>;

  constructor(options: ClientConfig) {
    this.config = options;
    this.#api = new ApiService(options);
    this.Auth$ = auth$;
    this.resources = this.#getMethods(apiSpec.paths);
  }

  authenticate(
    username: string | null,
    password: string | null,
    accountName: string,
    credentials?: string
  ) {
    return this.#api.authenticate(username, password, accountName, credentials);
  }

  signOut() {
    this.#api.signOut();
  }

  #getMethods(paths: any) {
    const getRouteFunction = this.#getRouteFunction.bind(this);
    const endpoints = Object.keys(paths);
    const tree = {};

    endpoints.forEach((endpoint) => {
      const path = _.chain(endpoint)
        .split("/")
        .reject(_.overSome(_.isEmpty, (string) => /[{}]/.test(string)))
        .map(_.camelCase)
        .value();
      const httpMethods = _.chain(paths).get(endpoint).keys().value();

      if (!_.has(tree, path)) {
        _.set(tree, path, {});
      }

      httpMethods.forEach((httpMethod) => {
        const newPath = path.concat(httpMethod);

        _.set(tree, newPath, [..._.get(tree, newPath, []), endpoint]);
      });
    });

    function traverse(node: { [x: string]: any }, key: string) {
      if (_.isArray(node[key])) {
        node[key] = getRouteFunction(node[key], key);
      } else {
        Object.keys(node[key]).forEach((value) => {
          traverse(node[key], value);
        });
      }
    }

    Object.keys(tree).forEach((key) => {
      traverse(tree, key);
    });

    return tree;
  }

  #getRouteFunction(endpoints: Array<string>, method: string) {
    const sendRequest = this.#api.sendRequest.bind(this.#api);

    return function (requestData: SDKMethodData) {
      const accountId = auth$.getValue().currentAccountId;
      const {
        data: originalData = {},
        params = {},
        body = null,
      } = requestData ?? {};
      const urlData = {
        account_id: accountId,
        ...originalData,
      };
      const paramsString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}}`)
        .join("&");
      const url = _.chain(endpoints)
        .sortBy((endpoint) => (endpoint.match(/{/) || []).length)
        .reverse()
        .map((endpoint) => {
          return _.reduce(
            urlData,
            (result, value, key) =>
              _.replace(
                result,
                `{${_.chain(key).snakeCase().toUpper().value()}}`,
                value || ""
              ),
            endpoint
          );
        })
        .find((endpoint) => !/{/.test(endpoint))
        .value();

      return sendRequest(url + "?" + paramsString, method.toUpperCase(), body);
    };
  }
}
