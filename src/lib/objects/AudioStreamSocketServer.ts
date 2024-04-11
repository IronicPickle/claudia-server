import SocketServer from "@shared/lib/objects/SocketServer.ts";
import { decodeJwt } from "@utils/api.ts";
import { fetchUser } from "@oak/setupOak.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import { guildServerSockets } from "@sockets/guilds.ts";
import { guildClientSockets } from "@sockets/guilds.ts";
import AudioStreamSocketClient from "./AudioStreamSocketClient.ts";
import config from "@config/config.ts";
import { log } from "@utils/generic.ts";
import { ConsoleColor } from "@shared/lib/enums/generic.ts";
import { logWs } from "@utils/generic.ts";

export default class AudioStreamSocketServer extends SocketServer {
  private guildId: string;
  private userId?: string;

  constructor(socket: WebSocket, guildId: string) {
    super(socket, async (token) => {
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

      guildServerSockets[guildId].add(user.discordUser.userId, this);

      return true;
    });

    this.guildId = guildId;

    this.addEventListener("authenticated", () => {
      const clientSocket = guildClientSockets.getSocket(this.guildId);
      if (clientSocket) return;

      guildClientSockets.add(
        this.guildId,
        new AudioStreamSocketClient(
          `${config.internal.botAddress}/internal/guilds/${this.guildId}/audioStream`,
          this.guildId
        )
      );
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
      "Web client",
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
