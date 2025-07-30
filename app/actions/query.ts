"use server";

import { mysqlConnector } from "@/lib/adapters/mysql";
import { pgConnector } from "@/lib/adapters/postgres";
import { Connection } from "@/types/connection";

export async function executeQuery(
  connectionDetails: Connection,
  query: string
) {
  console.log("Executing query:", query, connectionDetails);
  try {
    let results;
    if (
      !connectionDetails.database ||
      !connectionDetails.host ||
      !connectionDetails.user ||
      !connectionDetails.password ||
      !connectionDetails.port
    ) {
      return { error: "Missing required connection details" };
    }
    if (connectionDetails.type === "mysql") {
      const connection = await mysqlConnector({
        database: connectionDetails.database,
        host: connectionDetails.host,
        user: connectionDetails.user,
        password: connectionDetails.password,
        port: connectionDetails.port,
        ssl: false,
      });
      [results] = await connection.execute(query);
      await connection.end();
    } else if (connectionDetails.type === "postgresql") {
      const client = await pgConnector({
        database: connectionDetails.database,
        host: connectionDetails.host,
        user: connectionDetails.user,
        password: connectionDetails.password,
        port: connectionDetails.port,
        ssl: false,
      });
      const { rows } = await client.query(query);
      results = rows;
      await client.end();
    } else {
      throw new Error("Unsupported database type");
    }
    return { data: results };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
