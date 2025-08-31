"use server";

import { pgConnector } from "@/lib/adapters/postgres";
import { buildSQL } from "@/lib/helpers/helpers";
import { ColumnOptions, Connection } from "@/types/connection";

export async function getSchemas(connection: Connection) {
  const client = await pgConnector(connection);

  const query = `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
  AND schema_name NOT LIKE 'pg_toast%'
  AND schema_name NOT LIKE 'pg_temp%';`;
  const data = await client.query(query);
  await client.end();
  const schemas = data.rows.map((row) => row.schema_name as string);
  return schemas;
}
export async function getPgTableNames(
  connection: Connection,
  schema?: string
): Promise<{
  success: boolean;
  tables?: { name: string; count: number }[];
  message?: string;
  schema?: string;
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

    const query = schema
      ? `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema = $1
      `
      : `
        SELECT table_name, table_schema
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
      `;

    const response = schema
      ? await client.query(query, [schema])
      : await client.query(query);

    const tablesWithCounts: { name: string; count: number }[] = [];

    for (const row of response.rows) {
      const tableName = row.table_name;
      const tableSchema = schema ?? row.table_schema;

      const fullName = `"${tableSchema}"."${tableName}"`;

      const countRes = await client.query(`SELECT COUNT(*) FROM ${fullName}`);
      const count = parseInt(countRes.rows[0].count, 10);
      tablesWithCounts.push({ name: tableName, count });
    }

    await client.end();

    return { success: true, tables: tablesWithCounts, schema };
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
  tableName: string,
  schema?: string
) {
  const client = await pgConnector(connection);
  console.log("please", schema);

  const query = `
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
      AND cols.table_schema = kcu.table_schema
    LEFT JOIN
      information_schema.table_constraints tc
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_name = cols.table_name
      AND tc.table_schema = cols.table_schema
      AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
    WHERE
      cols.table_name = $1
      AND cols.table_schema = $2
  `;

  const params = schema ? [tableName, schema] : [tableName, "public"];

  const response = await client.query(query, params);

  await client.end();

  return response.rows;
}

export async function getTableDatas({
  connection,
  tableName,
  schema,
  limit = 20,
  page = 1,
}: {
  connection: Connection;
  tableName: string;
  schema?: string;
  limit?: number;
  page?: number;
}) {
  const offset = (page - 1) * limit;
  const client = await pgConnector(connection);

  // validate identifiers
  const isValidIdent = (name: string) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  if (!isValidIdent(tableName)) throw new Error("Invalid table name");
  if (schema && !isValidIdent(schema)) throw new Error("Invalid schema name");

  // build qualified table name
  const fullTableName = schema
    ? `"${schema}"."${tableName}"`
    : `"${tableName}"`;

  // parameterize LIMIT + OFFSET, keep identifiers safely quoted
  const response = await client.query(
    `SELECT * FROM ${fullTableName} LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  await client.end();

  return response.rows;
}

export async function insertDatas(
  connection: Connection,
  tableName: string,
  data: Record<string, unknown>,
  schema?: string
) {
  const client = await pgConnector(connection);

  console.log("insert", schema);

  const columns = Object.keys(data);
  const values = Object.values(data);

  const placeHolders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const fullTableName = schema
    ? `"${schema}"."${tableName}"`
    : `"${tableName}"`;

  const query = `INSERT INTO ${fullTableName} (${columns
    .map((col) => `"${col}"`)
    .join(", ")}) VALUES(${placeHolders}) RETURNING *`;

  const response = await client.query(query, values);
  await client.end();

  return response.rows;
}

export async function updateData(
  connection: Connection,
  tableName: string,
  pk: Record<string, unknown>,
  data: Record<string, unknown>,
  schema?: string
) {
  const client = await pgConnector(connection);

  const columns = Object.keys(data);
  const values = Object.values(data);

  // Properly quote identifiers
  const quoteIdent = (ident: string) => `"${ident.replace(/"/g, '""')}"`;

  const placeHolders = columns
    .map((column, i) => `${quoteIdent(column)} = $${i + 1}`)
    .join(", ");

  const pkColumn = Object.keys(pk)[0];
  const pkValue = Object.values(pk)[0];
  const pkParameterized = values.length + 1;
  const fullTableName = schema
    ? `"${schema}"."${tableName}"`
    : `"${tableName}"`;

  const query = `
    UPDATE ${fullTableName}
    SET ${placeHolders}
    WHERE ${quoteIdent(pkColumn)} = $${pkParameterized}
    RETURNING *;
  `;

  const response = await client.query(query, [...values, pkValue]);
  await client.end();

  return response.rows;
}

export async function deleteData(
  connection: Connection,
  tableName: string,
  pk: Record<string, unknown>,
  schema?: string
) {
  const client = await pgConnector(connection);

  const pkColumn = Object.keys(pk);
  const pkValue = Object.values(pk);

  if (!pkColumn || pkValue === undefined) {
    throw new Error("Primary key is missing or invalid.");
  }

  const fullTableName = schema
    ? `"${schema}"."${tableName}"`
    : `"${tableName}"`;

  const query = `DELETE FROM ${fullTableName} WHERE ${pkColumn} = $1 `;

  await client.query(query, pkValue);

  await client.end();

  return { success: true };
}

export async function createTable(
  connection: Connection,
  tableName: string,
  schema?: string
) {
  console.log("inside", connection);
  const client = await pgConnector(connection);
  const fullTableName = schema
    ? `"${schema}"."${tableName}"`
    : `"${tableName}"`;

  const query = `CREATE TABLE ${fullTableName} ();`;

  await client.query(query);
  await client.end();
  return { success: true };
}

export async function addPostgresColumn(
  connection: Connection,
  columns: ColumnOptions[],
  tableName: string,
  schema?: string
) {
  const client = await pgConnector(connection);
  console.log("now please", schema);

  const isValidIdent = (name: string) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  if (!isValidIdent(tableName)) throw new Error("Invalid table name");
  if (schema && !isValidIdent(schema)) throw new Error("Invalid schema name");

  const fullTableName = schema
    ? `"${schema}"."${tableName}"`
    : `"${tableName}"`;

  const query = buildSQL(columns, "postgresql", fullTableName);

  console.log("Generated query:", query);

  await client.query(query);
  await client.end();

  return { success: true };
}

export async function createSchema(connection: Connection, schema: string) {
  const client = await pgConnector(connection);
  if (!/^[a-zA-Z0-9_]+$/.test(schema)) {
    throw new Error("Invalid schema name");
  }
  const query = `CREATE SCHEMA ${schema}`;
  await client.query(query);

  await client.end();

  return { success: true };
}
