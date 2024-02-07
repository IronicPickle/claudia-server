import { router } from "@oak/setupOak.ts";

import internalRouter from "./internal/router.ts";

import authRouter from "./auth/router.ts";
import usersRouter from "./users/router.ts";

router.use("/internal", internalRouter.routes());

router.use("/auth", authRouter.routes());
router.use("/users", usersRouter.routes());
