import { isDev } from "../../config/config.ts";

export const log = (...text: any[]) => isDev && console.log("[Dev]", ...text);

export const logError = (...text: any[]) =>
  isDev && console.error("[Dev]", "[ERROR]", ...text);
