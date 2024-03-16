import { createRoute } from "@oak/setupOak.ts";
import {
  error,
  ok,
  parseParams,
  unauthorizedError,
  validationError,
} from "@shared/lib/utils/api.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import { parseValidators } from "@shared/lib/utils/generic.ts";
import DiscordUser from "@mongo/schemas/DiscordUser.ts";
import { logError } from "@utils/generic.ts";

import {
  RequestSpec,
  validator,
} from "@shared/lib/api/server/users/[userId]/guilds/[guildId]/members/getAll.ts";

export default createRoute((router) => {
  router.get("/", async (ctx) => {
    const session = ctx.state.session;
    if (session == null) return unauthorizedError()(ctx);

    const params = parseParams<RequestSpec["params"]>(ctx);

    const { userId, guildId } = params;

    const validators = validator(params);

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    if (userId !== session.discordUser.userId) return unauthorizedError()(ctx);

    try {
      const guildMembers = await DiscordGuildMember.aggregate([
        { $match: { guildId } },
        {
          $lookup: {
            from: DiscordUser.name,
            localField: "userId",
            foreignField: "userId",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
      ]).toArray();

      return ok({
        guildMembers,
      })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
