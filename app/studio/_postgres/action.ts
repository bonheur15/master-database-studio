"use server";

import { pgConnector } from "@/lib/adapters/postgres";
import { postgresConfig } from "@/types";

export async function getPgTableNames(configs: postgresConfig) {
  const client = await pgConnector(configs);

  const response = client.query(
    "SELECT table_name FROM information_schema.tables where table_type = 'BASE TABLE' and table_schema not in ('pg_catalog', 'information_schema');"
  );

  const alltables = (await response).rows;

  const tables = alltables.map((table) => table.table_name);

  return tables;
}

export async function getTableColumns(
  configs: postgresConfig,
  tableName: string
) {
  const client = await pgConnector(configs);

  const response = await client.query(`
  SELECT
    cols.column_name,
    cols.data_type,
    cols.column_default,
    cols.character_maximum_length,
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

export async function getTableData({
  configs,
  tableName,
  limit = 20,
  page = 1,
}: {
  configs: postgresConfig;
  tableName: string;
  limit?: number;
  page?: number;
}) {
  const offset = (page - 1) * limit;
  const client = await pgConnector(configs);

  const response = await client.query(
    `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset} `
  );

  const data = response.rows;

  return data;
}

export async function insertData({
  configs,
  tableName,
  data,
}: {
  configs: postgresConfig;
  tableName: string;
  data: Record<string, unknown>;
}) {
  const client = await pgConnector(configs);

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

export async function updateData({
  configs,
  tableName,
  pk,
  data,
}: {
  configs: postgresConfig;
  tableName: string;
  pk: Record<string, unknown>;
  data: Record<string, unknown>;
}) {
  const client = await pgConnector(configs);

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
  configs: postgresConfig,
  tableName: string,
  pk: Record<string, unknown>
) {
  const client = await pgConnector(configs);

  const pkColumn = Object.keys(pk);
  const pkValue = Object.values(pk);

  if (!pkColumn || pkValue === undefined) {
    throw new Error("Primary key is missing or invalid.");
  }

  const query = `DELETE FROM ${tableName} WHERE ${pkColumn} = $1 `;

  await client.query(query, pkValue);

  return { success: true };
}
