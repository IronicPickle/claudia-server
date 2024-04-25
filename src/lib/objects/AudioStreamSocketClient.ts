import SocketClient from "@shared/lib/objects/SocketClient.ts";
import SocketsManager from "@shared/lib/objects/SocketsManager.ts";
import { encodeSessionJwt } from "@utils/api.ts";
import { guildServerSockets } from "@sockets/guilds.ts";
import { log, logWs } from "@utils/generic.ts";
import { ConsoleColor } from "@shared/lib/enums/generic.ts";

const TOKEN = await encodeSessionJwt("internal");
const HEARTBEAT_INTERVAL_MS = 1000 * 60 * 2;

export default class AudioStreamSocketClient extends SocketClient {
  private guildId: string;

  constructor(url: string, guildId: string) {
    super(url, TOKEN, HEARTBEAT_INTERVAL_MS);

    this.guildId = guildId;

    const guildSocketsManager = this.getGuildSocketsManager();

    if (!guildSocketsManager) {
      guildServerSockets[guildId] = new SocketsManager();
      log(`Created socket manager for guild: ${guildId}`);
    }

    this.addEventListener("message", ({ name, data }) => {
      if (name.includes("authenticate") || name.includes("heartbeat")) return;

      const serverSockets = this.getGuildSocketsManager().getSockets();
      const serverSocket = serverSockets[data.socketId];
      if (serverSocket) {
        this.logEvent(
          ConsoleColor.Magenta,
          "PASSTHROUGH",
          "-",
          name,
          ConsoleColor.Reset,
          data
        );

        serverSocket.send(name, data);
      } else if (name.includes("event")) {
        for (const i in serverSockets) {
          this.logEvent(
            ConsoleColor.Red,
            "EVENT",
            "-",
            name,
            ConsoleColor.Reset,
            data
          );

          const socket = serverSockets[i];
          socket.send(name, data);
        }
      } else {
        console.log(serverSockets, { serverSocket }, data.socketId);
      }
    });

    this.addEventListener("messageRaw", (data) => {
      const sockets = this.getGuildSocketsManager().getSockets();
      for (const i in sockets) {
        const socket = sockets[i];

        socket.sendRaw(data);
      }
    });

    this.addEventListener("close", () => {
      const sockets = this.getGuildSocketsManager().getSockets();
      for (const i in sockets) {
        const socket = sockets[i];

        socket.destroy();
      }
    });

    this.addEventListener("authenticated", () => {
      this.logEvent(ConsoleColor.Yellow, "AUTHENTICATED");
    });

    this.addEventListener("heartbeat", () => {
      this.logEvent(ConsoleColor.White, "HEARTBEAT");
    });

    this.addEventListener("open", () => {
      this.logEvent(ConsoleColor.Green, "OPEN");
    });

    this.addEventListener("close", (code, wasClean) => {
      this.logEvent(
        ConsoleColor.Red,
        "CLOSE",
        "-",
        code,
        "-",
        wasClean ? "clean" : "unclean"
      );
    });
  }

  private logEvent(color: ConsoleColor, event: string, ...text: any[]) {
    logWs(
      ConsoleColor.Cyan,
      "Bot server",
      "-",
      color,
      event,
      ConsoleColor.Cyan,
      ...text,
      "",
      ConsoleColor.Cyan,
      "-",
      this.guildId,
      ConsoleColor.Reset
    );
  }

  private getGuildSocketsManager() {
    return guildServerSockets[this.guildId];
  }
}
