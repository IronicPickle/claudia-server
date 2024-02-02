import {
  badRequestError,
  error,
  ok,
  parseBody,
  unauthorizedError,
  validationError,
} from "../../../../claudia-shared/lib/utils/api.ts";
import { parseValidators } from "../../../../claudia-shared/lib/utils/generic.ts";
import { logError } from "../../lib/utils/generic.ts";
import { createRoute } from "../setupOak.ts";
import DiscordEndpoints from "../../discordApi/DiscordEndpoints.ts";
import DiscordUser from "../../mongo/schemas/DiscordUser.ts";

import {
  RequestSpec,
  validator,
} from "../../../../claudia-shared/lib/api/server/auth/login.ts";
import { forbiddenError } from "../../../../claudia-shared/lib/utils/api.ts";

export default createRoute((router) => {
  router.post("/login", async (ctx) => {
    const body = await parseBody<RequestSpec["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { code, state, redirectUri } = body;

    const validators = validator({ ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const tokenRes = await DiscordEndpoints.oauth2.token.call({
        body: {
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "identify",
        },
      });

      if (tokenRes.error || !tokenRes.data)
        return unauthorizedError("Credidentials invalid")(ctx);

      const meRes = await DiscordEndpoints.oauth2.me.call({
        body: {
          access_token: tokenRes.data.access_token,
        },
      });

      if (meRes.error || !meRes.data)
        return unauthorizedError("Credidentials invalid")(ctx);

      const user = await DiscordUser.findAndModify(
        {
          userId: meRes.data.user.id,
        },
        {
          update: {
            $set: {
              discordOauth: {
                accessToken: tokenRes.data.access_token,
                tokenType: tokenRes.data.token_type,
                expiresIn: tokenRes.data.expires_in,
                refreshToken: tokenRes.data.refresh_token,
                scope: tokenRes.data.scope,
              },
            },
          },
          new: true,
        }
      );

      if (!user) return forbiddenError("User not in database")(ctx);

      return ok()(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
