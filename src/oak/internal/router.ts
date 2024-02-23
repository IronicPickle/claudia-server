import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import discordRouter from "./discord/router.ts";

const router = new Router<State>();

router.use("/discord", discordRouter.routes());

export default router;
