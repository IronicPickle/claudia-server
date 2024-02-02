import Endpoint from "../../lib/objects/Endpoint.ts";
import { discordApi } from "../discordApi.ts";
import config from "../../config/config.ts";

import { RequestSpec } from "../../../../claudia-shared/lib/discordApi/oauth2/token.ts";

export default new Endpoint<RequestSpec>(
  async ({ body }) =>
    await discordApi
      .post("oauth2/token", {
        body: new URLSearchParams({
          client_id: config.discord.clientId,
          client_secret: config.discord.clientSecret,
          ...body,
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .json<RequestSpec["res"]>()
);
