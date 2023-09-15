import { GuildCreate } from "../../../../../claudia-shared/lib/ts/api/server/internal/guilds/guilds.ts";
import {
  badRequestError,
  conflictError,
  error,
  ok,
  parseBody,
  validationError,
} from "../../../../../claudia-shared/lib/utils/api.ts";
import { router } from "../../setupOak.ts";
import guildsValidator from "../../../../../claudia-shared/lib/validators/server/internal/guilds/guildsValidator.ts";
import { parseValidators } from "../../../../../claudia-shared/lib/utils/generic.ts";
import Guild from "../../../mongo/schemas/Guild.ts";
import { logError } from "../../../../../claudia-bot/src/lib/utils/generic.ts";

export default () => {
  router.post("/internal/discord/guilds", async (ctx) => {
    const body = await parseBody<GuildCreate["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId, name, description, joinedAt } = body;

    const validators = guildsValidator.create(body);

    const validation = parseValidators(validators);
    if (validation.failed || !guildId || !name)
      return validationError(validation)(ctx);

    try {
      const guild = await Guild.findOne({ guildId });
      if (guild) return conflictError("Guild already exists.")(ctx);

      await Guild.insertOne({ guildId, name, description, joinedAt });

      return ok(guild)(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
};
