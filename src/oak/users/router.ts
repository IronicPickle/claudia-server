import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import meRouter from "./me/router.ts";

const usersRouter = new Router<State>();

usersRouter.use("/me", meRouter.routes());

export default usersRouter;
