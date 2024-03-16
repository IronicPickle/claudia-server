import config from "@config/config.ts";
import { MongoClient } from "mongo";

export const mongoClient = new MongoClient();

await mongoClient.connect(config.mongo.address);

export const db = mongoClient.database(config.mongo.dbName);
