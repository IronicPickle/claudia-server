import { db } from "../setupMongo.ts";

export interface GuildSchema {
  guildId: string;
  name: string;
  description: string | null | undefined;
  joinedAt: number | undefined;
}

export default db.collection<GuildSchema>("guild");
