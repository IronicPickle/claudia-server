import { ConsoleColor } from "@shared/lib/enums/generic.ts";
import { enumContains } from "@shared/lib/utils/generic.ts";
import { isDev } from "@config/config.ts";

export const log = (...text: any[]) =>
  console.log(
    ...text.reduce((acc: any[], text) => {
      if (
        enumContains(ConsoleColor, text) ||
        enumContains(ConsoleColor, acc[acc.length - 1])
      ) {
        return [...acc.slice(0, -1), `${acc[acc.length - 1] ?? ""}${text}`];
      }
      return [...acc, text];
    }, [])
  );

export const logError = (...text: any[]) =>
  isDev && console.error("[Dev]", "[ERROR]", ...text);

export const logWs = (...text: any[]) =>
  log(ConsoleColor.Blue, "[WS]", ConsoleColor.Reset, ...text);
