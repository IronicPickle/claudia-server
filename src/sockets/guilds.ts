import SocketsManager from "@shared/lib/objects/SocketsManager.ts";
import AudioStreamSocketServer from "@objects/AudioStreamSocketServer.ts";
import AudioStreamSocketClient from "@objects/AudioStreamSocketClient.ts";

export const guildServerSocketManagers = {} as Record<
  string,
  SocketsManager<Record<string, AudioStreamSocketServer>>
>;

export const guildClientSockets = new SocketsManager<
  Record<string, AudioStreamSocketClient>
>();
