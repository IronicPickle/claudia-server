import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import login from "./login.ts";
import refresh from "./refresh.ts";

const authRouter = new Router<State>();

login.register(authRouter);
refresh.register(authRouter);

export default authRouter;
