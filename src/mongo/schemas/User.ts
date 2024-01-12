import { db } from "../setupMongo.ts";

export interface DiscordUserSchema {
  discordUserId: string;
}

export default db.collection<DiscordUserSchema>("discordUser");
