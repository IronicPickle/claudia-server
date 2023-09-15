import config from "../config/config.ts";
import { MongoClient } from "../deps/denoMongo.ts";

const client = new MongoClient();

await client.connect(config.mongo.address);

export const db = client.database("claudia");
