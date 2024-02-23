import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import getAll from "./getAll.ts";

const router = new Router<State>();

getAll.register(router);

export default router;
