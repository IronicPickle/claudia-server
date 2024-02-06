import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import guildsRouter from "./guilds/router.ts";

const discordRouter = new Router<State>();

discordRouter.use("/guilds", guildsRouter.routes());

export default discordRouter;
