export * from "https://deno.land/x/mongo@v0.31.2/mod.ts";

// import * as mongo from "https://deno.land/x/mongo@v0.31.2/mod.ts";
// import { Cluster } from "https://deno.land/x/mongo@v0.31.2/src/cluster.ts";
// import { WireProtocol } from "https://deno.land/x/mongo@v0.31.2/src/protocol/protocol.ts";

// type Operation<T extends mongo.Document> =
//   | {
//       insertOne: {
//         document: mongo.InsertDocument<T>;
//         options?: mongo.InsertOptions;
//       };
//     }
//   | {
//       updateOne: {
//         filter: mongo.Filter<T>;
//         update: mongo.UpdateFilter<T>;
//         options?: mongo.UpdateOptions;
//       };
//     }
//   | {
//       updateMany: {
//         filter: mongo.Filter<T>;
//         update: mongo.UpdateFilter<T>;
//         options?: mongo.UpdateOptions;
//       };
//     }
//   | {
//       deleteOne: {
//         filter: mongo.Filter<T>;
//         options?: mongo.DeleteOptions;
//       };
//     }
//   | {
//       deleteMany: {
//         filter: mongo.Filter<T>;
//         options?: mongo.DeleteOptions;
//       };
//     }
//   | {
//       replaceOne: {
//         filter: mongo.Filter<T>;
//         replacement: mongo.InsertDocument<T>;
//         options?: mongo.UpdateOptions;
//       };
//     };

// class Collection<T extends mongo.Document> extends mongo.Collection<T> {
//   #protocol: WireProtocol;
//   #dbName: string;

//   constructor(protocol: WireProtocol, dbName: string, readonly name: string) {
//     super(protocol, dbName, name);

//     this.#protocol = protocol;
//     this.#dbName = dbName;
//   }

//   async bulkWrite(
//     operations: Operation<T>[],
//     writeConcern?: mongo.Document,
//     ordered?: boolean
//   ) {
//     return await this.#protocol.commandSingle(this.#dbName, {
//       bulkWrite: this.name,
//       operations,
//       writeConcern,
//       ordered,
//     });
//   }
// }

// class Database extends mongo.Database {
//   #cluster: Cluster;

//   constructor(cluster: Cluster, readonly name: string) {
//     super(cluster, name);

//     this.#cluster = cluster;
//   }

//   collection<T extends mongo.Document = mongo.Document>(
//     name: string
//   ): Collection<T> {
//     return new Collection<T>(this.#cluster.protocol, this.name, name);
//   }
// }

// class MongoClient extends mongo.MongoClient {
//   #defaultDbName = "admin";

//   database(name = this.#defaultDbName): Database {
//     return new Database(this.getCluster(), name);
//   }
// }

// export * from "https://deno.land/x/mongo@v0.31.2/mod.ts";
// export { MongoClient, Database, Collection };
// export type { Operation };
