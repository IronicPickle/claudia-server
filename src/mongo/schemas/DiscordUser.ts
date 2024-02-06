import { DbDiscordPremiumTypes } from "@shared/lib/api/server/internal/discord/dbSpec.ts";
import { db } from "@mongo/setupMongo.ts";

export interface DiscordUserSchema {
  userId: string;
  username: string;
  discriminator: string;
  avatar?: string;
  locale?: string;
  premiumType?: DbDiscordPremiumTypes;
}

export default db.collection<DiscordUserSchema>("discordUser");
