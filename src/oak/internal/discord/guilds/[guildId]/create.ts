import {
  badRequestError,
  conflictError,
  error,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "@shared/lib/utils/api.ts";
import { parseValidators } from "@shared/lib/utils/generic.ts";
import DiscordGuild from "@mongo/schemas/DiscordGuild.ts";
import { logError } from "@utils/generic.ts";
import { upsertMembers } from "../utils.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import { createRoute } from "@oak/setupOak.ts";

import {
  RequestSpec,
  validator,
} from "../../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/[guildId]/create.ts";

export default createRoute((router) => {
  router.post("/", async (ctx) => {
    const params = parseParams<RequestSpec["params"]>(ctx);
    const body = await parseBody<RequestSpec["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId } = params;
    const { name, description, joinedAt, members } = body;

    const validators = validator({ ...params, ...body });

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
        { memberId: { $nin: memberIds }, guildId },
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
});
