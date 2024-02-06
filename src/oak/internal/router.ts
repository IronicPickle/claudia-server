import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import discordRouter from "./discord/router.ts";

const internalRouter = new Router<State>();

internalRouter.use("/discord", discordRouter.routes());

export default internalRouter;
