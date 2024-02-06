import { db } from "@mongo/setupMongo.ts";

export interface DiscordGuildSchema {
  guildId: string;
  name: string;
  description?: string | null;
  active: boolean;
  joinedAt?: number;
}

export default db.collection<DiscordGuildSchema>("discordGuild");
