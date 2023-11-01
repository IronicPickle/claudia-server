import { GuildMemberUpsert } from "../../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/members/membersSpec.ts";
import membersValidators from "../../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/members/membersValidators.ts";
import {
  badRequestError,
  error,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "../../../../../../../claudia-shared/lib/utils/api.ts";
import { parseValidators } from "../../../../../../../claudia-shared/lib/utils/generic.ts";
import { logError } from "../../../../../lib/utils/generic.ts";
import DiscordGuildMember from "../../../../../mongo/schemas/DiscordGuildMember.ts";
import DiscordUser, {
  DiscordUserSchema,
} from "../../../../../mongo/schemas/DiscordUser.ts";
import { router } from "../../../../setupOak.ts";

export default () => {
  router.put(
    "/internal/discord/guilds/:guildId/members/:memberId",
    async (ctx) => {
      const params = parseParams<GuildMemberUpsert["params"]>(ctx);
      const body = await parseBody<GuildMemberUpsert["body"]>(ctx);
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

      const validators = membersValidators.upsert({ ...params, ...body });

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
            upsert: true,
            new: true,
          }
        );

        if (!newMember) return error("Couldn't upsert guild member.")(ctx);

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
    }
  );
};
