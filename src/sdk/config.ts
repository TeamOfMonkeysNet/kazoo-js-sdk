import { AuthEndpoint, ClientConfig } from "../types/config.types";

export default class Config {
  public host: string;
  public authEndpoint: AuthEndpoint;

  constructor(config: ClientConfig) {
    const { host, authEndpoint = "user_auth" } = config;

    this.host = host;
    this.authEndpoint = authEndpoint;
  }
}
