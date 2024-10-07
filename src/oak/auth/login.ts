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
import { ObjectId } from "mongo";
import { isResError } from "@shared/lib/utils/api.ts";

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

      if (isResError(tokenRes))
        return unauthorizedError("Credidentials invalid")(ctx);

      const meRes = await DiscordEndpoints.oauth2.me.call({
        body: {
          access_token: tokenRes.data.access_token,
        },
      });

      if (isResError(meRes))
        return unauthorizedError("User does not exist")(ctx);

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

      if (!discordUser)
        return error("Couldn't find or create discord user.")(ctx);

      const user = await User.findAndModify(
        {
          discordUserId: discordUser.userId,
        },
        {
          update: {
            $set: {
              discordUserId: discordUser.userId,
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

      if (!user) return error("Couldn't find or create user.")(ctx);

      const sessionToken = await encodeSessionJwt(user._id, {
        type: "session",
      });
      const refreshToken = await encodeRefreshJwt(user._id, {
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
