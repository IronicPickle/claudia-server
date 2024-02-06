import config from "@config/config.ts";
import { MongoClient } from "mongo";

const client = new MongoClient();

await client.connect(config.mongo.address);

export const db = client.database("claudia");
