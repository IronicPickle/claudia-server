import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import membersRouter from "./members/router.ts";

const router = new Router<State>();

router.use("/members", membersRouter.routes());

export default router;
