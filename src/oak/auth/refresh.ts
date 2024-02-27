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
import User from "@mongo/schemas/User.ts";
import { encodeSessionJwt, decodeJwt } from "@utils/api.ts";
import { notFoundError } from "@shared/lib/utils/api.ts";

import { RequestSpec, validator } from "@shared/lib/api/server/auth/refresh.ts";
import { ObjectId } from "mongo";

export default createRoute((router) => {
  router.post("/refresh", async (ctx) => {
    const body = await parseBody<RequestSpec["body"]>(ctx);
    if (!body) return badRequestError("Body missing.")(ctx);

    const { refreshToken } = body;

    const validators = validator({ ...body });

    const validation = parseValidators(validators);
    if (validation.failed) return validationError(validation)(ctx);

    try {
      const payload = await decodeJwt(refreshToken, {
        ignoreExp: true,
      });

      if (!payload) return unauthorizedError("JWT signature invalid.")(ctx);

      const _id = payload.sub;

      const user = await User.findOne({
        _id: new ObjectId(_id),
      });

      if (!user) return notFoundError("User not found.")(ctx);

      const sessionToken = await encodeSessionJwt(user._id, {
        type: "session",
      });

      return ok({
        tokens: {
          sessionToken,
          refreshToken,
        },
      })(ctx);
    } catch (err: any) {
      logError(err);
      return error("Something went wrong.")(ctx);
    }
  });
});
