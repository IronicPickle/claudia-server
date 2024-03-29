import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import guildIdRouter from "./[guildId]/router.ts";

import getAll from "./getAll.ts";

const router = new Router<State>();

getAll.register(router);

router.use("/:guildId", guildIdRouter.routes());

export default router;
