import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import guildIdRouter from "./[guildId]/router.ts";

import sync from "./sync.ts";

const router = new Router<State>();

sync.register(router);

router.use("/:guildId", guildIdRouter.routes());

export default router;
