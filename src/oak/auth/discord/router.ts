import { Router } from "../../../deps/oak.ts";
import { State } from "../../setupOak.ts";

import login from "./login.ts";

const discordRouter = new Router<State>();

login.register(discordRouter);

export default discordRouter;
