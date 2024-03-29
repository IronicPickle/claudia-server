import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import login from "./login.ts";
import refresh from "./refresh.ts";

const router = new Router<State>();

login.register(router);
refresh.register(router);

export default router;
