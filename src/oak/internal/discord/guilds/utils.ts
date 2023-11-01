import {
  DbDiscordGuild,
  DbDiscordMember,
} from "../../../../../../claudia-shared/lib/api/server/internal/discord/dbSpec.ts";
import DiscordGuild from "../../../../mongo/schemas/DiscordGuild.ts";
import DiscordGuildMember from "../../../../mongo/schemas/DiscordGuildMember.ts";
import DiscordUser from "../../../../mongo/schemas/DiscordUser.ts";

export const upsertMembers = (members: DbDiscordMember[]) => {
  const promises: Promise<{
    upsertedCount: number;
    matchedCount: number;
    modifiedCount: number;
  }>[] = [];

  for (const member of members) {
    const { user } = member;

    promises.push(
      DiscordGuildMember.updateOne(
        {
          memberId: member.memberId,
          guildId: member.guildId,
        },
        {
          $set: {
            memberId: member.memberId,
            guildId: member.guildId,
            userId: user?.userId,
            active: member.active,
            avatar: member.avatar,
            joinedAt: member.joinedAt,
            nick: member.nick,
            permissions: member.permissions,
            roles: member.roles,
            communicationDisabledUntil: member.communicationDisabledUntil,
            premiumSince: member.premiumSince,
          },
        },
        { upsert: true }
      )
    );

    if (!user) continue;

    promises.push(
      DiscordUser.updateOne(
        {
          userId: user.userId,
        },
        {
          $set: {
            userId: user.userId,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            locale: user.locale,
            premiumType: user.premiumType,
          },
        },
        { upsert: true }
      )
    );
  }

  return promises;
};

export const upsertGuilds = (guilds: DbDiscordGuild[]) => {
  const promises: Promise<{
    upsertedCount: number;
    matchedCount: number;
    modifiedCount: number;
  }>[] = [];

  for (const guild of guilds) {
    promises.push(
      DiscordGuild.updateOne(
        { guildId: guild.guildId },
        {
          $set: {
            guildId: guild.guildId,
            name: guild.name,
            description: guild.description,
            active: guild.active,
            joinedAt: guild.joinedAt,
          },
        },
        { upsert: true }
      )
    );

    promises.push(...upsertMembers(guild.members));
  }

  return promises;
};
