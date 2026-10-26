import { Collection, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

interface StateDoc {
  _id: string;
  data: unknown[];
}

// Reuse one client across hot reloads in dev and across requests in prod
const globalForMongo = globalThis as unknown as {
  stacklineMongo?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!globalForMongo.stacklineMongo) {
    globalForMongo.stacklineMongo = new MongoClient(uri).connect();
  }
  return globalForMongo.stacklineMongo;
}

export async function getStateCollection(): Promise<Collection<StateDoc>> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB || "stackline").collection<StateDoc>("state");
}
