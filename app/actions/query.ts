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
    if (connectionDetails.type === "mysql") {
      const connection = await mysqlConnector(connectionDetails);
      [results] = await connection.execute(query);
      await connection.end();
    } else if (connectionDetails.type === "postgresql") {
      const client = await pgConnector(connectionDetails);
      const { rows } = await client.query(query);
      results = rows;
      await client.end();
    } else {
      throw new Error("Unsupported database type");
    }
    return { data: results };
  } catch (error: any) {
    return { error: error.message };
  }
}
