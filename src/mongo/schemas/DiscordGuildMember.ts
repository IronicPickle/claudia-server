import { db } from "@mongo/setupMongo.ts";

export interface DiscordGuildMemberSchema {
  _id: string;
  memberId: string;
  guildId: string;
  userId?: string;
  active: boolean;
  avatar?: string;
  joinedAt: number;
  nick?: string;
  permissions?: string;
  roles: string[];
  communicationDisabledUntil?: number;
  premiumSince?: number;
}

export default db.collection<DiscordGuildMemberSchema>("discordGuildMember");
