import {
  badRequestError,
  error,
  ok,
  parseBody,
  validationError,
} from "../../../../../../claudia-shared/lib/utils/api.ts";
import { router } from "../../../setupOak.ts";
import guildsValidator from "../../../../../../claudia-shared/lib/validators/server/internal/discord/guilds/guildsValidator.ts";
import { parseValidators } from "../../../../../../claudia-shared/lib/utils/generic.ts";
import Guild from "../../../../mongo/schemas/Guild.ts";
import { GuildsSync } from "../../../../../../claudia-shared/lib/ts/api/server/internal/discord/guilds.ts";
import { log, logError } from "../../../../lib/utils/generic.ts";

export default () => {
  router.post("/internal/discord/guilds/sync", async (ctx) => {
    const body = await parseBody<GuildsSync["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guilds } = body;

    const validators = guildsValidator.sync(body);

    const validation = parseValidators(validators);
    if (validation.failed || !guilds) return validationError(validation)(ctx);

    try {
      await Guild.findAndModify(
        { guildId: { $nin: guilds.map(({ guildId }) => guildId) } },
        {
          update: { $set: { active: false } },
        }
      );

      const res = await Promise.all(
        guilds.map(({ guildId, ...guild }) =>
          Guild.updateOne({ guildId }, { $set: guild }, { upsert: true })
        )
      );

      log(`Performed sync for ${res.length} guilds`);

      return ok({})(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
};
