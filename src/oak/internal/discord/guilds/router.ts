import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import membersRouter from "./members/router.ts";

import create from "./create.ts";
import sync from "./sync.ts";
import update from "./update.ts";
import upsert from "./upsert.ts";

const guildsRouter = new Router<State>();

create.register(guildsRouter);
sync.register(guildsRouter);
update.register(guildsRouter);
upsert.register(guildsRouter);

guildsRouter.use("/members", membersRouter.routes());

export default guildsRouter;
