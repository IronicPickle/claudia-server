import { router } from "@oak/setupOak.ts";

import authRouter from "./auth/router.ts";
import internalRouter from "./internal/router.ts";

router.use("/internal", internalRouter.routes());

router.use("/auth", authRouter.routes());
