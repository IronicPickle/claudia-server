import config from "../config/config.ts";
import { Application, Router } from "../deps/oak.ts";
import { log } from "../lib/utils/generic.ts";

import internalGuildsCreate from "./internal/discord/guilds/create.ts";
import internalGuildsUpdate from "./internal/discord/guilds/update.ts";
import internalGuildsUpsert from "./internal/discord/guilds/upsert.ts";
import internalGuildsSync from "./internal/discord/guilds/sync.ts";

import internalGuildsMembersCreate from "./internal/discord/guilds/members/create.ts";
import internalGuildsMembersUpdate from "./internal/discord/guilds/members/update.ts";
import internalGuildsMembersUpsert from "./internal/discord/guilds/members/upsert.ts";
import { ConsoleColor } from "../../../claudia-shared/lib/enums/generic.ts";
import { httpMethodColors } from "../../../claudia-shared/lib/constants/generic.ts";

export const app = new Application();
export const router = new Router();

export default () => {
  app.use(async ({ request }, next) => {
    log(
      ConsoleColor.Green,
      "[Oak]",
      ConsoleColor.Bright,
      httpMethodColors[request.method],
      request.method,
      ConsoleColor.Reset,
      "-",
      ConsoleColor.Cyan,
      request.url.pathname,
      ConsoleColor.Reset
    );

    await next();
  });

  internalGuildsSync();
  internalGuildsCreate();
  internalGuildsUpdate();
  internalGuildsUpsert();

  internalGuildsMembersCreate();
  internalGuildsMembersUpdate();
  internalGuildsMembersUpsert();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ port }) => {
    log(
      ConsoleColor.Green,
      "[Oak]",
      ConsoleColor.Reset,
      `Listening on ${port}`
    );
  });

  app.listen(config.oak.listenOptions);
};
