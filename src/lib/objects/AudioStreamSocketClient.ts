import SocketClient from "@shared/lib/objects/SocketClient.ts";
import SocketsManager from "@shared/lib/objects/SocketsManager.ts";
import { encodeSessionJwt } from "@utils/api.ts";
import { guildServerSockets } from "@sockets/guilds.ts";
import { log, logWs } from "@utils/generic.ts";
import { ConsoleColor } from "@shared/lib/enums/generic.ts";

const token = await encodeSessionJwt("internal");

export default class AudioStreamSocketClient extends SocketClient {
  private guildId: string;

  private guildSocketsManager: (typeof guildServerSockets)[string];

  constructor(url: string, guildId: string) {
    super(url, token);

    this.guildId = guildId;

    let guildSocketsManager = guildServerSockets[guildId];

    if (!guildSocketsManager) {
      guildSocketsManager = new SocketsManager();
      guildServerSockets[guildId] = guildSocketsManager;
      log(`Created socket manager for guild: ${guildId}`);
    }

    this.guildSocketsManager = guildSocketsManager;

    this.addEventListener("messageRaw", (data) => {
      const sockets = this.guildSocketsManager.getSockets();
      for (const i in sockets) {
        const socket = sockets[i];

        socket.sendRaw(data);
      }
    });

    this.addEventListener("authenticated", () => {
      this.logEvent(ConsoleColor.Yellow, "AUTHENTICATED");
    });

    this.addEventListener("open", () => {
      this.logEvent(ConsoleColor.Green, "OPEN");
    });

    this.addEventListener("close", () => {
      this.logEvent(ConsoleColor.Red, "CLOSE");
    });
  }

  private logEvent(color: ConsoleColor, event: string) {
    logWs(
      ConsoleColor.Cyan,
      "Bot Socket",
      "-",
      color,
      event,
      ConsoleColor.Cyan,
      "-",
      this.guildId,
      ConsoleColor.Reset
    );
  }
}
