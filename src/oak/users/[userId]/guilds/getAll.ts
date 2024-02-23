import { createRoute } from "@oak/setupOak.ts";
import {
  error,
  notFoundError,
  ok,
  parseParams,
  unauthorizedError,
} from "@shared/lib/utils/api.ts";
import User from "@mongo/schemas/User.ts";
import { ObjectId } from "mongo";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import DiscordUser from "@mongo/schemas/DiscordUser.ts";
import DiscordGuild from "@mongo/schemas/DiscordGuild.ts";
import { logError } from "@utils/generic.ts";
import { RequestSpec } from "../../../../../../claudia-shared/lib/api/server/users/[userId]/guilds/getAll.ts";

export default createRoute((router) => {
  router.get("/", async (ctx) => {
    const authedUserId = ctx.state.userId;
    if (authedUserId == null) return unauthorizedError()(ctx);

    const params = parseParams<RequestSpec["params"]>(ctx);

    const { userId } = params;

    if (userId !== authedUserId) return unauthorizedError()(ctx);

    try {
      const user = await User.findOne(
        {
          _id: new ObjectId(userId),
        },
        {
          projection: {
            discordUserId: 1,
          },
        }
      );

      if (!user) return notFoundError("User not found.")(ctx);

      const discordUser = await DiscordUser.findOne({
        _id: new ObjectId(user.discordUserId),
      });

      if (!discordUser) return notFoundError("Discord user not found.")(ctx);

      const discordGuildMembers = DiscordGuildMember.find({
        userId: discordUser.userId,
      });

      const discordGuilds = await Promise.all(
        await discordGuildMembers.map((discordGuild) =>
          DiscordGuild.findOne({
            guildId: discordGuild.guildId,
          })
        )
      );

      return ok({
        discordGuilds,
      })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
