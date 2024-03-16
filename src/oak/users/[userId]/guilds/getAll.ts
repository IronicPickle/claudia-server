import { createRoute } from "@oak/setupOak.ts";
import {
  error,
  ok,
  parseParams,
  unauthorizedError,
  validationError,
} from "@shared/lib/utils/api.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import DiscordGuild from "@mongo/schemas/DiscordGuild.ts";
import DiscordUser from "@mongo/schemas/DiscordUser.ts";
import { logError } from "@utils/generic.ts";
import {
  RequestSpec,
  validator,
} from "@shared/lib/api/server/users/[userId]/guilds/getAll.ts";
import { parseValidators } from "@shared/lib/utils/generic.ts";

export default createRoute((router) => {
  router.get("/", async (ctx) => {
    const session = ctx.state.session;
    if (session == null) return unauthorizedError()(ctx);

    const params = parseParams<RequestSpec["params"]>(ctx);

    const { userId } = params;

    const validators = validator(params);

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    if (userId !== session.discordUser.userId) return unauthorizedError()(ctx);

    try {
      const guildIds = await DiscordGuildMember.find({
        userId,
      }).map((discordGuildMember) => discordGuildMember.guildId);

      const discordGuilds = await DiscordGuild.find({
        guildId: {
          $in: guildIds,
        },
      }).toArray();

      return ok({
        discordGuilds,
      })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
