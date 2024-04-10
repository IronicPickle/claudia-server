import SocketsManager from "@shared/lib/objects/SocketsManager.ts";
import AudioStreamSocketServer from "@objects/AudioStreamSocketServer.ts";
import AudioStreamSocketClient from "@objects/AudioStreamSocketClient.ts";
import config from "@config/config.ts";

export const guildServerSockets = new SocketsManager<
  Record<string, AudioStreamSocketServer>
>();

export const guildClientSocket = new AudioStreamSocketClient(
  `${config.internal.botAddress}/internal/audioStream`
);
