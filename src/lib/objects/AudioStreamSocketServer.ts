import SocketServer from "@shared/lib/objects/SocketServer.ts";
import { decodeJwt } from "@utils/api.ts";
import { fetchUser } from "@oak/setupOak.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import { guildServerSocketManagers } from "@sockets/guilds.ts";
import { guildClientSockets } from "@sockets/guilds.ts";
import AudioStreamSocketClient from "./AudioStreamSocketClient.ts";
import config from "@config/config.ts";
import { log } from "@utils/generic.ts";
import { ConsoleColor } from "@shared/lib/enums/generic.ts";
import { logWs } from "@utils/generic.ts";
import SocketsManager from "@shared/lib/objects/SocketsManager.ts";
import { SocketMessageNames } from "@shared/lib/ts/sockets.ts";

export default class AudioStreamSocketServer extends SocketServer {
  private guildId: string;
  private userId?: string;

  constructor(socket: WebSocket, guildId: string) {
    super(
      socket,
      async (token) => {
        const payload = await decodeJwt(token);

        if (!payload?.sub) return false;

        const user = await fetchUser(payload.sub);

        if (!user) return false;

        this.userId = user.discordUser.userId;

        const guild = await DiscordGuildMember.findOne({
          guildId,
          userId: user.discordUser.userId,
        });

        if (!guild) return false;

        let guildSocketsManager = this.getGuildSocketsManager();

        // Create socket manager if not created
        if (!guildSocketsManager) {
          guildSocketsManager = new SocketsManager();
          guildServerSocketManagers[guildId] = guildSocketsManager;
          log(`Created socket manager for guild: ${guildId}`);
        }

        // Push socket server to socket manager
        guildSocketsManager.add(this.id, this);

        return true;
      },
      {
        resOnAuth: false,
      }
    );

    this.guildId = guildId;

    this.addEventListener("message", ({ name, data }) => {
      if (name.includes("authenticate") || name.includes("heartbeat")) return;

      const clientSocket = guildClientSockets.getSocket(this.guildId);
      if (!clientSocket) return;

      this.logEvent(
        ConsoleColor.Magenta,
        "PASSTHROUGH",
        "-",
        name,
        ConsoleColor.Reset,
        data
      );
      clientSocket.send(name, {
        ...data,
        socketId: this.id,
        userId: this.userId,
      });
    });

    this.addEventListener("authenticated", () => {
      const clientSocket = guildClientSockets.getSocket(this.guildId);
      if (clientSocket) return this.send(SocketMessageNames.AuthenticateRes);

      const newClientSocket = new AudioStreamSocketClient(
        `${config.internal.botAddress}/internal/guilds/${this.guildId}/audioStream`,
        this.guildId
      );

      newClientSocket.once("authenticated", () =>
        this.send(SocketMessageNames.AuthenticateRes)
      );

      guildClientSockets.add(this.guildId, newClientSocket);
    });

    this.addEventListener("close", () => {
      const guildSocketsManager = this.getGuildSocketsManager();

      console.log(Object.keys(guildSocketsManager.getSockets()).length);

      if (Object.keys(guildSocketsManager.getSockets()).length <= 1)
        guildClientSockets.getSocket(this.guildId).destroy();
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
      "Web client",
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
    return guildServerSocketManagers[this.guildId];
  }
}
