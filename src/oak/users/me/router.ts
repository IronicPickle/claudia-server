import { Router } from "oak";
import { State } from "@oak/setupOak.ts";

import get from "./get.ts";

const meRouter = new Router<State>();

get.register(meRouter);

export default meRouter;
