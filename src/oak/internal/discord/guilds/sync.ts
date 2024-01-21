import {
  badRequestError,
  error,
  ok,
  parseBody,
  validationError,
} from "../../../../../../claudia-shared/lib/utils/api.ts";
import guildsValidator from "../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/guildsValidator.ts";
import { parseValidators } from "../../../../../../claudia-shared/lib/utils/generic.ts";
import DiscordGuild from "../../../../mongo/schemas/DiscordGuild.ts";
import { GuildsSync } from "../../../../../../claudia-shared/lib/api/server/internal/discord/guilds/guildsSpec.ts";
import { log, logError } from "../../../../lib/utils/generic.ts";
import DiscordGuildMember from "../../../../mongo/schemas/DiscordGuildMember.ts";
import { upsertGuilds } from "./utils.ts";
import { createRoute } from "../../../setupOak.ts";

export default createRoute((router) => {
  router.put("/sync", async (ctx) => {
    const body = await parseBody<GuildsSync["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guilds } = body;

    const validators = guildsValidator.sync(body);

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const guildIds = guilds.map(({ guildId }) => guildId);

      await DiscordGuild.updateMany(
        { guildId: { $nin: guildIds } },
        {
          $set: { active: false },
        }
      );

      const memberQuery = guilds.reduce(
        (acc, { members }) => [
          ...acc,
          ...members.map(({ memberId, guildId }) => ({
            memberId,
            guildId,
          })),
        ],
        [] as {
          memberId: string;
          guildId: string;
        }[]
      );

      await DiscordGuildMember.updateMany(
        {
          $and: [
            { $nor: memberQuery },
            {
              guildId: {
                $in: guildIds,
              },
            },
          ],
        },
        {
          $set: {
            active: false,
          },
        }
      );

      const res = await Promise.all(upsertGuilds(guilds));

      const { upsertedCount, modifiedCount } = res.reduce(
        (acc, { upsertedCount, modifiedCount }) => {
          acc.upsertedCount + upsertedCount;
          acc.modifiedCount + modifiedCount;

          return acc;
        },
        {
          upsertedCount: 0,
          modifiedCount: 0,
        }
      );

      log(
        "Guild sync complete -",
        guilds.length,
        "guilds -",
        upsertedCount,
        "upserted -",
        modifiedCount,
        "modified."
      );

      return ok({ upsertedCount, modifiedCount })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
