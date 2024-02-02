import { DbDiscordPremiumTypes } from "../../../../claudia-shared/lib/api/server/internal/discord/dbSpec.ts";
import { db } from "../setupMongo.ts";

export interface DiscordUserSchema {
  userId: string;
  username: string;
  discriminator: string;
  avatar: string | undefined;
  locale: string | undefined;
  premiumType: DbDiscordPremiumTypes | undefined;

  discordOauth?: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string;
  };
}

export default db.collection<DiscordUserSchema>("discordUser");
