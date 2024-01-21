import { GuildMemberCreate } from "../../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/members/membersSpec.ts";
import membersValidators from "../../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/members/membersValidators.ts";
import {
  badRequestError,
  conflictError,
  error,
  notFoundError,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "../../../../../../../claudia-shared/lib/utils/api.ts";
import { parseValidators } from "../../../../../../../claudia-shared/lib/utils/generic.ts";
import { logError } from "../../../../../lib/utils/generic.ts";
import DiscordGuild from "../../../../../mongo/schemas/DiscordGuild.ts";
import DiscordGuildMember from "../../../../../mongo/schemas/DiscordGuildMember.ts";
import DiscordUser, {
  DiscordUserSchema,
} from "../../../../../mongo/schemas/DiscordUser.ts";
import { createRoute } from "../../../../setupOak.ts";

export default createRoute((router) => {
  router.post("/:memberId", async (ctx) => {
    const params = parseParams<GuildMemberCreate["params"]>(ctx);
    const body = await parseBody<GuildMemberCreate["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId, memberId } = params;

    const {
      avatar,
      joinedAt,
      nick,
      permissions,
      roles,
      communicationDisabledUntil,
      premiumSince,

      user,
    } = body;

    const validators = membersValidators.create({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const member = await DiscordGuildMember.findOne({ guildId, memberId });
      if (member) return conflictError("Guild member already exists.")(ctx);

      const guild = await DiscordGuild.findOne({ guildId });
      if (!guild) return notFoundError("Guild doesn't exist.")(ctx);

      const newMember = await DiscordGuildMember.insertOne({
        guildId,
        memberId,
        userId: user?.userId,
        active: true,
        avatar,
        joinedAt,
        nick,
        permissions,
        roles,
        communicationDisabledUntil,
        premiumSince,
      });

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
