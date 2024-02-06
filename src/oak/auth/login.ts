import {
  badRequestError,
  error,
  ok,
  parseBody,
  unauthorizedError,
  validationError,
} from "@shared/lib/utils/api.ts";
import { parseValidators } from "@shared/lib/utils/generic.ts";
import { logError } from "@utils/generic.ts";
import { createRoute } from "@oak/setupOak.ts";
import DiscordEndpoints from "@discordApi/DiscordEndpoints.ts";
import DiscordUser from "@mongo/schemas/DiscordUser.ts";
import User from "@mongo/schemas/User.ts";
import { encodeRefreshJwt, encodeSessionJwt } from "@utils/api.ts";

import { RequestSpec, validator } from "@shared/lib/api/server/auth/login.ts";

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

      const user = await User.findAndModify(
        {
          discordUserId: meRes.data.user.id,
        },
        {
          update: {
            $set: {
              discordUserId: meRes.data.user.id,
              discordOauth: {
                accessToken: tokenRes.data.access_token,
                tokenType: tokenRes.data.token_type,
                expiresIn: tokenRes.data.expires_in,
                refreshToken: tokenRes.data.refresh_token,
                scope: tokenRes.data.scope,
              },
            },
          },
          upsert: true,
          new: true,
          fields: {
            discordUserId: 1,
          },
        }
      );

      const discordUser = await DiscordUser.findAndModify(
        {
          userId: meRes.data.user.id,
        },
        {
          update: {
            $set: {
              userId: meRes.data.user.id,
              username: meRes.data.user.username,
              discriminator: meRes.data.user.discriminator,
            },
          },
          upsert: true,
          new: true,
        }
      );

      const sessionToken = await encodeSessionJwt(meRes.data.user.id, {
        type: "session",
      });
      const refreshToken = await encodeRefreshJwt(meRes.data.user.id, {
        type: "refresh",
      });

      return ok({
        tokens: {
          sessionToken,
          refreshToken,
        },
        user,
        discordUser,
      })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
