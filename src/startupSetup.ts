import Endpoints from "@api/Endpoints.ts";
import { log, logError } from "@utils/generic.ts";

export default async () => {
  await sendStartupEvent();
};

export const sendStartupEvent = async () => {
  log("[Initial Setup]", "Sending startup event...");

  const { error } = await Endpoints.internal.events.startup.call({});

  if (error) logError(error.error);
};
