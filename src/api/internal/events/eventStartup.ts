import { EventStartup } from "../../../../../claudia-shared/lib/ts/api/bot/internal/events.ts";
import { RequestInputs } from "../../../../../claudia-shared/lib/ts/api/generic.ts";
import { apiCall, api } from "../../api.ts";

export default async ({}: RequestInputs<EventStartup>) =>
  await apiCall(
    async () =>
      await api
        .post("internal/events/startup", {
          headers: {
            "content-type": "application/json",
          },
          json: {},
        })
        .json<EventStartup["res"]>()
  );
