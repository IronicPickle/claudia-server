import { Config } from "./config.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const config: Config = {
  authSecret: Deno.env.get("AUTH_SECRET") as string,
  internal: {
    botAddress: Deno.env.get("INTERNAL_BOT_ADDRESS") ?? "http://localhost:81",
  },
  oak: {
    listenOptions: {
      port: parseInt(Deno.env.get("OAK_PORT") ?? "80"),
    },
  },
  mongo: {
    address: Deno.env.get("MONGO_ADDRESS") ?? "mongodb://127.0.0.1:27017",
    dbName: Deno.env.get("DB_NAME") ?? "claudia",
  },
  discord: {
    clientId: Deno.env.get("DISCORD_CLIENT_ID") as string,
    clientSecret: Deno.env.get("DISCORD_CLIENT_SECRET") as string,
  },
};

export default config;
