import { GuildUpdate } from "../../../../../../claudia-shared/lib/ts/api/server/internal/discord/guilds.ts";
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
import guildsValidator from "../../../../../../claudia-shared/lib/validators/server/internal/discord/guilds/guildsValidator.ts";
import { parseValidators } from "../../../../../../claudia-shared/lib/utils/generic.ts";
import Guild from "../../../../mongo/schemas/Guild.ts";
import { logError } from "../../../../lib/utils/generic.ts";

export default () => {
  router.patch("/internal/discord/guilds/:guildId", async (ctx) => {
    const params = parseParams<GuildUpdate["params"]>(ctx);
    const body = await parseBody<GuildUpdate["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId } = params;
    const { active, name, description, joinedAt } = body;

    const validators = guildsValidator.update({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed || !guildId) return validationError(validation)(ctx);

    try {
      const guild = await Guild.findAndModify(
        { guildId },
        {
          update: {
            $set: {
              guildId,
              active,
              name,
              description,
              joinedAt,
            },
          },
          new: true,
        }
      );

      if (!guild) return conflictError("Guild doesn't exist.")(ctx);

      return ok(guild)(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
};
