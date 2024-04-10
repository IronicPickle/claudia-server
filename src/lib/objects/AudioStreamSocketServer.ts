import SocketServer from "@shared/lib/objects/SocketServer.ts";
import { decodeJwt } from "@utils/api.ts";
import { fetchUser } from "@oak/setupOak.ts";
import DiscordGuildMember from "@mongo/schemas/DiscordGuildMember.ts";
import { guildServerSockets } from "@sockets/guilds.ts";

export default class AudioStreamSocketServer extends SocketServer {
  constructor(socket: WebSocket, guildId: string) {
    super(socket, async (token) => {
      const payload = await decodeJwt(token);

      if (!payload?.sub) return false;

      const user = await fetchUser(payload.sub);

      if (!user) return false;

      const guild = await DiscordGuildMember.findOne({
        guildId,
        userId: user.discordUser.userId,
      });

      if (!guild) return false;

      guildServerSockets.add(guildId, this);

      return true;
    });
  }
}
