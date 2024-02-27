import { error, ok, unauthorizedError } from "@shared/lib/utils/api.ts";
import { logError } from "@utils/generic.ts";
import { createRoute } from "@oak/setupOak.ts";

export default createRoute((router) => {
  router.get("/", (ctx) => {
    const session = ctx.state.session;
    if (session == null) return unauthorizedError()(ctx);

    try {
      return ok(session)(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
