import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import guildsRouter from "./guilds/router.ts";

const router = new Router<State>();

router.use("/guilds", guildsRouter.routes());

export default router;
