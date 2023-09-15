import config from "../config/config.ts";
import { Application, Router } from "../deps/oak.ts";
import { log } from "../lib/utils/generic.ts";

import internalGuildsCreate from "./internal/guilds/create.ts";
import internalGuildsUpdate from "./internal/guilds/update.ts";
import internalGuildsUpsert from "./internal/guilds/upsert.ts";

export const app = new Application();
export const router = new Router();

export default () => {
  internalGuildsCreate();
  internalGuildsUpdate();
  internalGuildsUpsert();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ port }) => {
    log("[Oak]", `Listening on ${port}`);
  });

  app.listen(config.oak.listenOptions);
};
