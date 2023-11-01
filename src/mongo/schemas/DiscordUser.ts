import { DbDiscordPremiumTypes } from "../../../../claudia-shared/lib/api/server/internal/discord/dbSpec.ts";
import { db } from "../setupMongo.ts";

export interface DiscordUserSchema {
  userId: string;
  username: string;
  discriminator: string;
  avatar: string | undefined;
  locale: string | undefined;
  premiumType: DbDiscordPremiumTypes | undefined;
}

export default db.collection<DiscordUserSchema>("discordUser");
