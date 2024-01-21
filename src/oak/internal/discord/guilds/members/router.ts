import { Router } from "../../../../../deps/oak.ts";
import { State } from "../../../../setupOak.ts";

import create from "./create.ts";
import update from "./update.ts";
import upsert from "./upsert.ts";

const membersRouter = new Router<State>();

create.register(membersRouter);
update.register(membersRouter);
upsert.register(membersRouter);

export default membersRouter;
