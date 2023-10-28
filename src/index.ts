import config, { env } from "./config/config.ts";
import { log } from "./lib/utils/generic.ts";
import setupOak from "./oak/setupOak.ts";

import "./mongo/setupMongo.ts";
import startupSetup from "./startupSetup.ts";

const start = async () => {
  if (!config.authSecret) throw Error("AUTH_SECRET missing in env!");

  log("Deno Version", "-", Deno.version);
  log("Starting server", "-", env.toUpperCase());
  log(config);

  setupOak();
  startupSetup();
};

start();
