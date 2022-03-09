import Config from "./sdk/config";
import SDK from "./sdk/sdk";
import { ClientConfig } from "./types/config.types";

export default (config: ClientConfig) => new SDK(new Config(config));
