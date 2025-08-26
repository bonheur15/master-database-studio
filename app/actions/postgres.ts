"use server";

import { pgConnector } from "@/lib/adapters/postgres";
import { Connection } from "@/types/connection";

export async function getPgTableNames(connection: Connection): Promise<{
  success: boolean;
  tables?: { name: string; count: number }[];
  message?: string;
}> {
  try {
    if (connection.type !== "postgresql") {
      return {
        success: false,
        message: "Only PostgreSQL connections are supported for table listing.",
      };
    }

    if (!connection.host || !connection.user || !connection.database) {
      return {
        success: false,
        message:
          "Missing required PostgreSQL connection details (host, user, database).",
      };
    }

    const client = await pgConnector(connection);

    // Get table names
    const response = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema');
    `);

    const tableNames = response.rows.map((row) => row.table_name);

    const tablesWithCounts: { name: string; count: number }[] = [];
    for (const tableName of tableNames) {
      const countRes = await client.query(
        `SELECT COUNT(*) FROM "${tableName}"`
      );
      const count = parseInt(countRes.rows[0].count, 10);
      tablesWithCounts.push({ name: tableName, count });
    }

    await client.end();

    return { success: true, tables: tablesWithCounts };
  } catch (error) {
    console.error("Error fetching PostgreSQL tables:", error);
    return {
      success: false,
      message: `Failed to fetch tables: ${(error as Error).message}`,
    };
  }
}

export async function getTableColumns(
  connection: Connection,
  tableName: string
) {
  const client = await pgConnector(connection);

  const response = await client.query(`
  SELECT
    cols.column_name,
    cols.data_type,
    cols.column_default,
    cols.character_maximum_length,
    cols.is_nullable,
    cols.numeric_precision,
    cols.dtd_identifier,
    CASE
      WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'PRIMARY KEY'
      WHEN tc.constraint_type = 'UNIQUE' THEN 'UNIQUE'
      ELSE NULL
    END AS constraint_type
  FROM
    information_schema.columns cols
  LEFT JOIN
    information_schema.key_column_usage kcu
    ON cols.table_name = kcu.table_name
    AND cols.column_name = kcu.column_name
  LEFT JOIN
    information_schema.table_constraints tc
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_name = cols.table_name
    AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
  WHERE
    cols.table_name = '${tableName}'
    AND cols.table_schema NOT IN ('pg_catalog', 'information_schema');
`);

  const columns = response.rows;

  return columns;
}

export async function getTableDatas({
  connection,
  tableName,
  limit = 20,
  page = 1,
}: {
  connection: Connection;
  tableName: string;
  limit?: number;
  page?: number;
}) {
  const offset = (page - 1) * limit;
  const client = await pgConnector(connection);

  const response = await client.query(
    `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset} `
  );

  const data = response.rows;

  return data;
}

export async function insertDatas(
  connection: Connection,
  tableName: string,
  data: Record<string, unknown>
) {
  const client = await pgConnector(connection);

  const columns = Object.keys(data);
  const values = Object.values(data);

  const placeHolders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const query = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES(${placeHolders}) RETURNING *`;

  const response = await client.query(query, values);

  const dataReturned = response.rows;

  return dataReturned;
}

export async function updateData(
  connection: Connection,
  tableName: string,
  pk: Record<string, unknown>,
  data: Record<string, unknown>
) {
  const client = await pgConnector(connection);

  const columns = Object.keys(data);

  const values = Object.values(data);

  const placeHolders = columns
    .map((column, i) => `${column} = $${i + 1}`)
    .join(", ");

  const pkColumn = Object.keys(pk);
  const pkValue = Object.values(pk)[0];
  const pkParameterized = values.length + 1;

  const query = `UPDATE ${tableName} SET ${placeHolders} WHERE ${pkColumn} = $${pkParameterized} RETURNING *`;

  const response = await client.query(query, [...values, pkValue]);

  const dataReturned = response.rows;

  return dataReturned;
}

export async function deleteData(
  connection: Connection,
  tableName: string,
  pk: Record<string, unknown>
) {
  const client = await pgConnector(connection);

  const pkColumn = Object.keys(pk);
  const pkValue = Object.values(pk);

  if (!pkColumn || pkValue === undefined) {
    throw new Error("Primary key is missing or invalid.");
  }

  const query = `DELETE FROM ${tableName} WHERE ${pkColumn} = $1 `;

  await client.query(query, pkValue);

  client.end();

  return { success: true };
}
