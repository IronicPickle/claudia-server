import config from "@config/config.ts";
import { Application, Router } from "oak";
import { log } from "@utils/generic.ts";
import { ConsoleColor } from "@shared/lib/enums/generic.ts";
import { httpMethodColors } from "@shared/lib/constants/generic.ts";
import { oakCors } from "cors";
import { decodeJwt } from "@utils/api.ts";
import { forbiddenError, unauthorizedError } from "@shared/lib/utils/api.ts";

export interface State {
  userId?: "internal" | string;
}

export const createRoute = (callback: (router: Router<State>) => void) => ({
  register: callback,
});

export const app = new Application<State>();
export const router = new Router<State>();

export default async () => {
  app.use(async ({ request }, next) => {
    log(
      ConsoleColor.Green,
      "[Oak]",
      ConsoleColor.Bright,
      httpMethodColors[request.method],
      request.method,
      ConsoleColor.Reset,
      "-",
      ConsoleColor.Cyan,
      request.url.pathname,
      ConsoleColor.Reset
    );

    await next();
  });

  app.use(async ({ state, request }, next) => {
    const jwt = request.headers.get("Authorization")?.replace("BEARER ", "");
    if (jwt) {
      const payload = await decodeJwt(jwt);

      if (payload) state.userId = payload.sub;
    }
    await next();
  });

  await import("./routes.ts");

  app.use(
    oakCors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(async (ctx, next) => {
    if (
      ctx.request.url.pathname.startsWith("/internal") &&
      ctx.state.userId !== "internal"
    ) {
      return forbiddenError()(ctx);
    }

    await next();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ port }) => {
    log(
      ConsoleColor.Green,
      "[Oak]",
      ConsoleColor.Reset,
      `Listening on ${port}`
    );
  });

  app.listen(config.oak.listenOptions);
};
