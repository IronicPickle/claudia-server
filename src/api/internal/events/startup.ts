import { RequestSpec } from "../../../../../claudia-shared/lib/api/bot/internal/events/startup.ts";
import Endpoint from "../../../lib/objects/Endpoint.ts";
import { api } from "../../api.ts";

export default new Endpoint<RequestSpec>(
  async () =>
    await api
      .post("internal/events/startup", {
        headers: {
          "content-type": "application/json",
        },
      })
      .json<RequestSpec["res"]>()
);
