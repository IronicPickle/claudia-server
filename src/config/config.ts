import { ListenOptions } from "../deps/oak.ts";
import developmentConfig from "./development.config.ts";
import productionConfig from "./production.config.ts";

export interface Config {
  authSecret: string;
  internal: {
    botAddress: string;
  };
  oak: {
    listenOptions: ListenOptions;
  };
  mongo: {
    address: string;
  };
}

export const env = Deno.env.get("DENO_ENV") ?? "development";

export const isDev = env !== "production";
export const isProd = env === "production";

const config: Record<string, Config> = {
  test: developmentConfig,
  development: developmentConfig,
  preview: developmentConfig,
  production: productionConfig,
};

export default config[env];
