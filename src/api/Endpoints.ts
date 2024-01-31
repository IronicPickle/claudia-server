import internalEventsStartup from "./internal/events/startup.ts";

export default abstract class Endpoints {
  static internal = {
    events: {
      startup: internalEventsStartup,
    },
  };
}
