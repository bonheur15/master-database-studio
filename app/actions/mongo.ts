import { mgConnector } from "@/lib/adapters/mongo";
import { mongoConfig } from "@/types/connection";
import { ObjectId } from "mongodb";

export async function getCollections({
  configs,
  url,
  dbName,
}: {
  configs?: mongoConfig;
  url?: string;
  dbName?: string;
}) {
  const client = await mgConnector({
    configs,
    url,
  });

  const database = client.db(configs?.database || dbName);

  const collections = [];
  const colls = database.listCollections({}, { nameOnly: true });
  for await (const doc of colls) {
    collections.push(doc);
  }

  return collections;
}

export async function deleteCollections({
  collection,
  configs,
  url,
  dbName,
}: {
  collection: string;
  configs?: mongoConfig;
  url?: string;
  dbName?: string;
}) {
  const client = await mgConnector({
    configs,
    url,
  });

  const database = client.db(configs?.database || dbName);
  const collectionToDelete = database.collection(collection);
  await collectionToDelete.drop();

  return { success: true };
}

export async function getCollectionDocs({
  collection,
  page = 1,
  pagesize = 20,
  configs,
  url,
  dbName,
}: {
  collection: string;
  page?: number;
  pagesize?: number;
  configs?: mongoConfig;
  url?: string;
  dbName?: string;
}) {
  const client = await mgConnector({
    configs,
    url,
  });

  const offset = (page - 1) * pagesize;
  const database = client.db(configs?.database || dbName);
  const col = database.collection(collection);
  const docs = await col.find().skip(offset).limit(pagesize).toArray();
  return docs;
}

export async function insertDoc({
  collectionName,
  document,
  configs,
  url,
  dbName,
}: {
  collectionName: string;
  document: Record<string, unknown>;
  configs?: mongoConfig;
  url?: string;
  dbName?: string;
}) {
  const client = await mgConnector({ configs, url });
  const db = client.db(configs?.database || dbName);
  const col = db.collection(collectionName);

  const result = await col.insertOne(document);
  return result;
}

export async function updateDoc({
  collectionName,
  id,
  update,
  configs,
  url,
  dbName,
}: {
  collectionName: string;
  id: string;
  update: Record<string, unknown>;
  configs?: mongoConfig;
  url?: string;
  dbName?: string;
}) {
  const client = await mgConnector({ configs, url });
  const db = client.db(configs?.database || dbName);
  const col = db.collection(collectionName);

  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );

  return result;
}
