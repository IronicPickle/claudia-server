import { Router } from "../../../deps/oak.ts";
import { State } from "../../setupOak.ts";
import guildsRouter from "./guilds/router.ts";

const discordRouter = new Router<State>();

discordRouter.use("/guilds", guildsRouter.routes());

export default discordRouter;
