import { error, ok, parseParams } from "@shared/lib/utils/api.ts";
import { logError } from "@utils/generic.ts";
import { createRoute } from "@oak/setupOak.ts";
import { GenericErrorCode } from "@shared/lib/enums/api.ts";
import { RequestSpec } from "@shared/lib/api/server/guilds/[guildId]/audioStream/get.ts";
import AudioStreamSocketServer from "@objects/AudioStreamSocketServer.ts";

export default createRoute((router) => {
  router.get("/", async (ctx) => {
    const params = parseParams<RequestSpec["params"]>(ctx);

    const { guildId } = params;

    try {
      if (!ctx.isUpgradable)
        return error("Cannot upgrade.", GenericErrorCode.NotImplemented, 501);

      new AudioStreamSocketServer(ctx.upgrade(), guildId);

      return ok({})(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
