import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import memberIdRouter from "./[memberId]/router.ts";

const router = new Router<State>();

router.use("/:memberId", memberIdRouter.routes());

export default router;
