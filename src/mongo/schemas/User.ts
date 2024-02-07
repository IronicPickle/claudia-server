import { db } from "@mongo/setupMongo.ts";

export interface UserSchema {
  _id: string;
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
