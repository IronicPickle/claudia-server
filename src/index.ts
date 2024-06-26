import config, { env } from "@config/config.ts";
import { log } from "@utils/generic.ts";
import setupOak from "@oak/setupOak.ts";

import "@mongo/setupMongo.ts";
import startupSetup from "./startupSetup.ts";

const start = () => {
  if (!config.authSecret) throw Error("AUTH_SECRET missing in env!");

  log("Deno Version", "-", Deno.version);
  log("Starting server", "-", env.toUpperCase());
  log(config);

  setupOak();
  startupSetup();
};

start();

// setInterval(() => {
//   console.log(Object.keys(guildSockets.getSockets()));
// }, 1000);
