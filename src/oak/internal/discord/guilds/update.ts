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
import DiscordGuild from "@mongo/schemas/DiscordGuild.ts";
import { logError } from "@utils/generic.ts";
import { createRoute } from "@oak/setupOak.ts";

import {
  RequestSpec,
  validator,
} from "@shared/lib/api/server/internal/discord/guilds/{guildId}/update.ts";

export default createRoute((router) => {
  router.patch("/:guildId", async (ctx) => {
    const params = parseParams<RequestSpec["params"]>(ctx);
    const body = await parseBody<RequestSpec["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { guildId } = params;
    const { active, name, description, joinedAt } = body;

    const validators = validator({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const guild = await DiscordGuild.findAndModify(
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

      if (!guild) return notFoundError("Guild doesn't exist.")(ctx);

      return ok(guild)(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
