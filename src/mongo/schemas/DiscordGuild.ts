import { db } from "../setupMongo.ts";

export interface DiscordGuildSchema {
  guildId: string;
  name: string;
  description: string | null | undefined;
  active: boolean;
  joinedAt: number | undefined;
}

export default db.collection<DiscordGuildSchema>("discordGuild");
