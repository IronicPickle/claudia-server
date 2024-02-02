import oauth2Token from "./oauth2/token.ts";
import oauth2Me from "./oauth2/@me.ts";

export default abstract class DiscordEndpoints {
  static oauth2 = {
    token: oauth2Token,
    me: oauth2Me,
  };
}
