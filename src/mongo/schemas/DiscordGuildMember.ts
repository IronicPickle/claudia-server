import { db } from "../setupMongo.ts";

export interface DiscordGuildMemberSchema {
  memberId: string;
  guildId: string;
  userId: string | undefined;
  active: boolean;
  avatar: string | undefined;
  joinedAt: number;
  nick: string | undefined;
  permissions: string | undefined;
  roles: string[];
  communicationDisabledUntil: number | undefined;
  premiumSince: number | undefined;
}

export default db.collection<DiscordGuildMemberSchema>("discordGuildMember");
