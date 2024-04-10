import Endpoints from "@api/Endpoints.ts";
import { log, logError } from "@utils/generic.ts";
import { isResError } from "@shared/lib/utils/api.ts";
import { guildClientSocket } from "@sockets/guilds.ts";

export default async () => {
  await sendStartupEvent();
};

export const sendStartupEvent = async () => {
  log("[Initial Setup]", "Sending startup event...");

  const res = await Endpoints.internal.events.startup.call({});

  if (isResError(res)) logError(res.error);
};
