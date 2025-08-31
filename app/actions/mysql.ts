"use server";

import { mysqlConnector } from "@/lib/adapters/mysql";
import { pgConnector } from "@/lib/adapters/postgres";
import { buildSQL, sanitizeIdentifier } from "@/lib/helpers/helpers";
import {
  ColumnOptions,
  Connection,
  TableColumn,
  TableSchema,
} from "@/types/connection";

export async function getMysqlData(connection: Connection, tableName: string) {
  const mysqlConnection = await mysqlConnector(connection);

  // Get schema
  const [schemaRows] = await mysqlConnection.execute(
    `SHOW COLUMNS FROM \`${tableName}\``
  );
  interface MySQLSchemaRow {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string | null;
    Extra: string;
  }

  const columns: TableColumn[] = (schemaRows as MySQLSchemaRow[]).map(
    (row) => ({
      columnName: row.Field,
      dataType: row.Type,
      isNullable: row.Null === "YES",
      columnKey: row.Key,
      defaultValue: row.Default,
      extra: row.Extra,
    })
  );
  const schema: TableSchema = { tableName, columns };

  // Get data
  const [dataRows] = await mysqlConnection.execute(
    `SELECT * FROM \`${tableName}\``
  );
  await mysqlConnection.end();

  return {
    success: true,
    data: dataRows as Record<string, unknown>[],
    schema,
  };
}

export async function insertMysqlRaw(
  connection: Connection,
  tableName: string,
  data: Record<string, unknown>
) {
  const mysqlConnection = await mysqlConnector(connection);

  const columns = Object.keys(data).map(sanitizeIdentifier);
  const values = Object.values(data);
  const placeholders = columns.map(() => "?").join(", ");

  const query = `INSERT INTO \`${sanitizeIdentifier(
    tableName
  )}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders})`;

  await mysqlConnection.execute(query, values);
  await mysqlConnection.end();
}

export async function deleteMysqlRow(
  connection: Connection,
  tableName: string,
  primaryKeyColumn: string,
  primaryKeyValue: string | number
) {
  const mysqlConnection = await mysqlConnector(connection);

  const query = `DELETE FROM \`${tableName}\` WHERE \`${primaryKeyColumn}\` = ?`;
  await mysqlConnection.execute(query, [primaryKeyValue]);
  await mysqlConnection.end();

  return { success: true };
}

export async function updateMysqlRow(
  connection: Connection,
  tableName: string,
  primaryKeyColumn: string,
  primaryKeyValue: string | number,
  rowData: Record<string, unknown>
) {
  const mysqlConnection = await mysqlConnector(connection);

  const updates = Object.keys(rowData)
    .map((col) => `\`${col}\` = ?`)
    .join(", ");
  const values = [...Object.values(rowData), primaryKeyValue];

  const query = `UPDATE \`${tableName}\` SET ${updates} WHERE \`${primaryKeyColumn}\` = ?`;
  await mysqlConnection.execute(query, values);
  await mysqlConnection.end();

  return { success: true };
}
export async function addMysqlColumn(
  connection: Connection,
  column: ColumnOptions[],
  tableName: string
) {
  const client = await mysqlConnector(connection);

  const query = buildSQL(column, "mysql", tableName);
  client.query(query);
  client.end();
  return { success: true };
}
