import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import meRouter from "./me/router.ts";
import userIdRouter from "./[userId]/router.ts";

const router = new Router<State>();

router.use("/me", meRouter.routes());
router.use("/:userId", userIdRouter.routes());

export default router;
