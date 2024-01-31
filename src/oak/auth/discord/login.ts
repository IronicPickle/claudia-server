import {
  RequestSpec,
  validator,
} from "../../../../../claudia-shared/lib/api/server/auth/discord/login.ts";
import {
  badRequestError,
  error,
  ok,
  parseBody,
  parseParams,
  validationError,
} from "../../../../../claudia-shared/lib/utils/api.ts";
import { parseValidators } from "../../../../../claudia-shared/lib/utils/generic.ts";
import { logError } from "../../../lib/utils/generic.ts";
import { createRoute } from "../../setupOak.ts";

export default createRoute((router) => {
  router.post("/:guildId", async (ctx) => {
    const params = parseParams<RequestSpec["params"]>(ctx);
    const body = await parseBody<RequestSpec["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const {} = params;
    const {} = body;

    const validators = validator({ ...params, ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      return ok()(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
