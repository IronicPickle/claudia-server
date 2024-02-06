import {
  badRequestError,
  error,
  notFoundError,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "@shared/lib/utils/api.ts";
import { parseValidators } from "@shared/lib/utils/generic.ts";
import { logError } from "@utils/generic.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import DiscordUser, { DiscordUserSchema } from "@mongo/schemas/DiscordUser.ts";
import { createRoute } from "@oak/setupOak.ts";

import {
  RequestSpec,
  validator,
} from "@shared/lib/api/server/internal/discord/guilds/{guildId}/members/{memberId}/update.ts";

export default createRoute((router) => {
  router.patch("/:memberId", async (ctx) => {
    const params = parseParams<RequestSpec["params"]>(ctx);
    const body = await parseBody<RequestSpec["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId, memberId } = params;

    const {
      active,
      avatar,
      joinedAt,
      nick,
      permissions,
      roles,
      communicationDisabledUntil,
      premiumSince,

      user,
    } = body;

    const validators = validator({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const newMember = await DiscordGuildMember.findAndModify(
        { guildId, memberId },
        {
          update: {
            $set: {
              userId: user?.userId,
              active,
              avatar,
              joinedAt,
              nick,
              permissions,
              roles,
              communicationDisabledUntil,
              premiumSince,
            },
          },
          new: true,
        }
      );

      if (!newMember) return notFoundError("Guild member doesn't exist.")(ctx);

      let newUser: DiscordUserSchema | undefined;

      if (user) {
        newUser = await DiscordUser.findAndModify(
          { userId: user.userId },
          {
            update: {
              $set: {
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.avatar,
                locale: user.locale,
                premiumType: user.premiumType,
              },
            },
            upsert: true,
            new: true,
          }
        );
      }

      return ok({ ...newMember, user: newUser })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
