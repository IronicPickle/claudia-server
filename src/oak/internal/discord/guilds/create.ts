import { GuildCreate } from "../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/guildsSpec.ts";
import {
  badRequestError,
  conflictError,
  error,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "../../../../../../claudia-shared/lib/utils/api.ts";
import { router } from "../../../setupOak.ts";
import guildsValidator from "../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/guildsValidator.ts";
import { parseValidators } from "../../../../../../claudia-shared/lib/utils/generic.ts";
import DiscordGuild from "../../../../mongo/schemas/DiscordGuild.ts";
import { logError } from "../../../../lib/utils/generic.ts";
import { upsertMembers } from "./utils.ts";
import DiscordGuildMember from "../../../../mongo/schemas/DiscordGuildMember.ts";

export default () => {
  router.post("/internal/discord/guilds/:guildId", async (ctx) => {
    const params = parseParams<GuildCreate["params"]>(ctx);
    const body = await parseBody<GuildCreate["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId } = params;
    const { name, description, joinedAt, members } = body;

    const validators = guildsValidator.create({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const guild = await DiscordGuild.findOne({ guildId });
      if (guild) return conflictError("Guild already exists.")(ctx);

      const newGuild = await DiscordGuild.insertOne({
        guildId,
        active: true,
        name,
        description,
        joinedAt,
      });

      const memberIds = members.map(({ memberId }) => memberId);

      await DiscordGuildMember.updateMany(
        { memberId: { $nin: memberIds } },
        {
          $set: { active: false },
        }
      );

      await Promise.all(upsertMembers(members));

      return ok(newGuild)(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
};
