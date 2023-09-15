import { GuildUpsert } from "../../../../../claudia-shared/lib/ts/api/server/internal/guilds/guilds.ts";
import {
  badRequestError,
  error,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "../../../../../claudia-shared/lib/utils/api.ts";
import { router } from "../../setupOak.ts";
import guildsValidator from "../../../../../claudia-shared/lib/validators/server/internal/guilds/guildsValidator.ts";
import { parseValidators } from "../../../../../claudia-shared/lib/utils/generic.ts";
import Guild from "../../../mongo/schemas/Guild.ts";
import { logError } from "../../../../../claudia-bot/src/lib/utils/generic.ts";

export default () => {
  router.put("/internal/discord/guilds/:guildId", async (ctx) => {
    const params = parseParams<GuildUpsert["params"]>(ctx);
    const body = await parseBody<GuildUpsert["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId } = params;
    const { active, name, description, joinedAt } = body;

    const validators = guildsValidator.upsert({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed || !guildId || !name || active == null)
      return validationError(validation)(ctx);

    try {
      const guild = await Guild.findAndModify(
        { guildId },
        {
          update: { guildId, active, name, description, joinedAt },
          upsert: true,
          new: true,
        }
      );

      if (!guild) return error("Couldn't create guild.")(ctx);

      return ok(guild)(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
};
