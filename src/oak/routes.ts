import authRouter from "./auth/router.ts";
import internalRouter from "./internal/router.ts";
import { router } from "./setupOak.ts";

router.use("/internal", internalRouter.routes());

router.use("/auth", authRouter.routes());
