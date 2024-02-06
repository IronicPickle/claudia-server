import { Router } from "oak";
import { State } from "../setupOak.ts";
import login from "./login.ts";

const authRouter = new Router<State>();

login.register(authRouter);

export default authRouter;
