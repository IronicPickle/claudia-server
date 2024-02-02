import Endpoint from "../../lib/objects/Endpoint.ts";
import { discordApi } from "../discordApi.ts";

import { RequestSpec } from "../../../../claudia-shared/lib/discordApi/oauth2/@me.ts";

export default new Endpoint<RequestSpec>(
  async ({ body: { access_token } }) =>
    await discordApi
      .get("oauth2/@me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .json<RequestSpec["res"]>()
);
