import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import create from "./create.ts";
import update from "./update.ts";
import upsert from "./upsert.ts";

const router = new Router<State>();

create.register(router);
update.register(router);
upsert.register(router);

export default router;
