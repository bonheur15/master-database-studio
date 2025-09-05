"use server";

import { mgConnector } from "@/lib/adapters/mongo";
import { Connection } from "@/types/connection";
import { ObjectId } from "mongodb";

export async function getCollections(connection: Connection) {
  console.log("confs", connection);
  const client = await mgConnector(connection);

  const database = client.db(connection.database);

  const collections = [];
  const colls = database.listCollections({}, { nameOnly: true });

  for await (const doc of colls) {
    const collectionName = doc.name;
    const collection = database.collection(collectionName);
    const count = await collection.estimatedDocumentCount(); // or countDocuments() for more accuracy

    collections.push({
      name: collectionName,
      count,
    });
  }

  return { success: true, tables: collections };
}

export async function deleteCollections({
  collection,
  connection,
}: {
  collection: string;
  connection: Connection;
}) {
  const client = await mgConnector(connection);

  const database = client.db(connection.database);
  const collectionToDelete = database.collection(collection);
  await collectionToDelete.drop();

  return { success: true };
}

export async function getCollectionDocs({
  collection,
  page = 1,
  pagesize = 10,
  connection,
}: {
  collection: string;
  page?: number;
  pagesize?: number;
  connection: Connection;
}) {
  const client = await mgConnector(connection);

  const offset = (page - 1) * pagesize;
  const database = client.db(connection.database);
  const col = database.collection(collection);
  const docs = await col.find().skip(offset).limit(pagesize).toArray();
  return JSON.parse(JSON.stringify(docs));
}

export async function insertDoc(
  collectionName: string,
  document: Record<string, unknown>,
  connection: Connection
) {
  const client = await mgConnector(connection);
  const db = client.db(connection.database);
  const col = db.collection(collectionName);

  const result = await col.insertOne(document);
  return result;
}

export async function updateDoc(
  collectionName: string,
  id: string,
  update: Record<string, unknown>,
  connection: Connection
) {
  const client = await mgConnector(connection);
  const db = client.db(connection.database);
  const col = db.collection(collectionName);

  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );

  return result;
}

export async function deleteDoc(
  collectionName: string,
  id: string,
  connection: Connection
) {
  const client = await mgConnector(connection);
  const db = client.db(connection.database);
  const col = db.collection(collectionName);

  await col.deleteOne({
    _id: new ObjectId(id),
  });
  return { success: true };
}

export async function createCollection(
  collectionName: string,
  connection: Connection
) {
  const client = await mgConnector(connection);
  const db = client.db(connection.database);

  await db.createCollection(collectionName);

  return { success: true };
}
