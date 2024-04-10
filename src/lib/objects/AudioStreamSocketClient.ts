import SocketClient from "@shared/lib/objects/SocketClient.ts";
import { encodeSessionJwt } from "@utils/api.ts";

const token = await encodeSessionJwt("internal");

export default class AudioStreamSocketClient extends SocketClient {
  constructor(url: string) {
    super(url, token);
  }
}
