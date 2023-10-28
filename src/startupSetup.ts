import eventStartup from "./api/internal/events/eventStartup.ts";
import { log, logError } from "./lib/utils/generic.ts";

export default async () => {
  await sendStartupEvent();
};

export const sendStartupEvent = async () => {
  log("[Initial Setup]", "Sending startup event...");

  const { error } = await eventStartup({});

  if (error) logError(error.error);
};
