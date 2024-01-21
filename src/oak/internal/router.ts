import { Router } from "../../deps/oak.ts";
import { State } from "../setupOak.ts";
import discordRouter from "./discord/router.ts";

const internalRouter = new Router<State>();

internalRouter.use("/discord", discordRouter.routes());

export default internalRouter;
