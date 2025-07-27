"use server";

import { Connection } from "@/types/connection";
import mysql from "mysql2/promise";
import { Client as PgClient } from "pg";
import { MongoClient } from "mongodb";

export async function testConnection(
  connection: Omit<Connection, "id" | "encryptedCredentials">
): Promise<{ success: boolean; message: string }> {
  console.log("Testing connection:", connection);

  if (!connection.host || !connection.port) {
    return {
      success: false,
      message: "Missing required connection details (host or port).",
    };
  }

  try {
    switch (connection.type) {
      case "mysql":
        const mysqlConnection = await mysql.createConnection({
          host: connection.host,
          port: connection.port,
          user: connection.user,
          password: connection.password,
          database: connection.database,
        });
        await mysqlConnection.end();
        console.log("Connected to MySQL successfully");
        return {
          success: true,
          message: `Successfully connected to MySQL at ${connection.host}:${connection.port}.`,
        };
      case "postgresql":
        const pgClient = new PgClient({
          host: connection.host,
          port: connection.port,
          user: connection.user,
          password: connection.password,
          database: connection.database,
        });
        await pgClient.connect();
        await pgClient.end();
        return {
          success: true,
          message: `Successfully connected to PostgreSQL at ${connection.host}:${connection.port}.`,
        };
      case "mongodb":
        const mongoUri = `mongodb://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`;
        const mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        await mongoClient.close();
        return {
          success: true,
          message: `Successfully connected to MongoDB at ${connection.host}:${connection.port}.`,
        };
      default:
        return {
          success: false,
          message: `Unsupported database type: ${connection.type}.`,
        };
    }
  } catch (error) {
    console.error("Connection error:", error);
    return {
      success: false,
      message: `Failed to connect to ${connection.type}: ${
        (error as { message: string }).message
      }`,
    };
  }
}
