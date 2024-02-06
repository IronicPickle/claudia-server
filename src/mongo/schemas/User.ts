import { db } from "@mongo/setupMongo.ts";

export interface UserSchema {
  discordUserId: string;
  discordOauth?: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string;
  };
}

export default db.collection<UserSchema>("user");
