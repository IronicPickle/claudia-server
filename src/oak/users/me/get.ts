import {
  error,
  ok,
  unauthorizedError,
  notFoundError,
} from "@shared/lib/utils/api.ts";
import { logError } from "@utils/generic.ts";
import { createRoute } from "@oak/setupOak.ts";
import DiscordUser from "@mongo/schemas/DiscordUser.ts";
import User from "@mongo/schemas/User.ts";
import { ObjectId } from "mongo";

export default createRoute((router) => {
  router.get("/", async (ctx) => {
    const userId = ctx.state.userId;
    if (userId == null) return unauthorizedError()(ctx);

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

      return ok({
        user,
        discordUser,
      })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
