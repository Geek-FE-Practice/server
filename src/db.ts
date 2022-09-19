import { MongoClient } from "mongodb";

const connectionString =
  (process.env.CONNECTION_STRING as string) || "mongodb://root:example@localhost:27017/";

export const client = new MongoClient(connectionString);
export const db = client.db("data");

process.on("exit", () => {
  client.close();
});
