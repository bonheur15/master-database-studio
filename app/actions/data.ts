"use server";

import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import { Connection, TableSchema, TableColumn } from "@/types/connection";
import { getCollectionDocs } from "./mongo";

interface GetTableDataResult {
  success: boolean;
  data?: unknown[];
  schema?: TableSchema;
  message?: string;
}

export async function getTableData(
  connection: Connection,
  tableName: string
): Promise<GetTableDataResult> {
  console.log("Fetching table data:", tableName, connection);
  try {
    if (connection.type === "mysql") {
      const mysqlConnection = await mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });

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
    } else if (connection.type === "postgresql") {
      const pgClient = new PgClient({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });
      await pgClient.connect();

      // Get schema
      const schemaQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = $1
        ORDER BY ordinal_position;
      `;
      const schemaResult = await pgClient.query(schemaQuery, [tableName]);
      const columns: TableColumn[] = schemaResult.rows.map((row) => ({
        columnName: row.column_name,
        dataType: row.data_type,
        isNullable: row.is_nullable === "YES",
        columnKey: "",
        defaultValue: row.column_default,
        extra: "",
      }));

      const pkQuery = `
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `;
      const pkResult = await pgClient.query(pkQuery, [tableName]);
      const primaryKeys = pkResult.rows.map((row) => row.attname);

      columns.forEach((col) => {
        if (primaryKeys.includes(col.columnName)) {
          col.columnKey = "PRI";
        }
      });

      const schema: TableSchema = { tableName, columns };

      // Get data
      const dataResult = await pgClient.query(`SELECT * FROM "${tableName}"`);
      await pgClient.end();

      return { success: true, data: dataResult.rows, schema };
    } else if (connection.type === "mongodb") {
      console.log("MongoDB connection details:", tableName, connection);
      let mongoUri: string;
      if (connection.protocol === "mongodb+srv") {
        mongoUri = `mongodb+srv://${connection.user}:${connection.password}@${connection.host}/${connection.database}?retryWrites=true&w=majority&appName=Cluster0`;
      } else {
        mongoUri = `mongodb://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`;
      }

      try {
        const data = await getCollectionDocs({
          collection: tableName,
          page: 1,
          url: mongoUri,
          pagesize: 10,
          dbName: connection.database,
        });
        return {
          success: true,
          data: data,
        };
      } catch (error) {
        console.error("Error fetching MongoDB data:", error);
        return {
          success: false,
          message: `Failed to fetch data from MongoDB: ${
            (error as Error).message
          }`,
        };
      }
    } else {
      return { success: false, message: "Unsupported database type." };
    }
  } catch (error: unknown) {
    console.error("Error fetching table data:", error);
    return {
      success: false,
      message: `Failed to fetch table data: ${(error as Error).message}`,
    };
  }
}

interface CrudResult {
  success: boolean;
  message?: string;
}

export async function insertRow(
  connection: Connection,
  tableName: string,
  rowData: Record<string, unknown>
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      const mysqlConnection = await mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });

      const columns = Object.keys(rowData);
      const values = Object.values(rowData);
      const placeholders = columns.map(() => "?").join(", ");

      const query = `INSERT INTO \`${tableName}\` (\`${columns.join(
        "`, `"
      )}\`) VALUES (${placeholders})`;
      await mysqlConnection.execute(query, values);
      await mysqlConnection.end();
      return { success: true, message: "Row inserted successfully." };
    } else if (connection.type === "postgresql") {
      const pgClient = new PgClient({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });
      await pgClient.connect();

      const columns = Object.keys(rowData);
      const values = Object.values(rowData);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

      const query = `INSERT INTO \"${tableName}\" (\"${columns.join(
        '", "'
      )}\") VALUES (${placeholders})`;
      await pgClient.query(query, values);
      await pgClient.end();
      return { success: true, message: "Row inserted successfully." };
    } else {
      return { success: false, message: "Unsupported database type." };
    }
  } catch (error: unknown) {
    console.error("Error inserting row:", error);
    return {
      success: false,
      message: `Failed to insert row: ${(error as Error).message}`,
    };
  }
}

export async function updateRow(
  connection: Connection,
  tableName: string,
  primaryKeyColumn: string,
  primaryKeyValue: string | number | null,
  rowData: Record<string, unknown>
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      const mysqlConnection = await mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });

      const updates = Object.keys(rowData)
        .map((col) => `\`${col}\` = ?`)
        .join(", ");
      const values = [...Object.values(rowData), primaryKeyValue];

      const query = `UPDATE \`${tableName}\` SET ${updates} WHERE \`${primaryKeyColumn}\` = ?`;
      await mysqlConnection.execute(query, values);
      await mysqlConnection.end();
      return { success: true, message: "Row updated successfully." };
    } else if (connection.type === "postgresql") {
      const pgClient = new PgClient({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });
      await pgClient.connect();

      const updates = Object.keys(rowData)
        .map((col, i) => `\"${col}\" = $${i + 1}`)
        .join(", ");
      const values = [...Object.values(rowData), primaryKeyValue];
      const pkIndex = Object.keys(rowData).length + 1;

      const query = `UPDATE \"${tableName}\" SET ${updates} WHERE \"${primaryKeyColumn}\" = $${pkIndex}`;
      await pgClient.query(query, values);
      await pgClient.end();
      return { success: true, message: "Row updated successfully." };
    } else {
      return { success: false, message: "Unsupported database type." };
    }
  } catch (error: unknown) {
    console.error("Error updating row:", error);
    return {
      success: false,
      message: `Failed to update row: ${(error as Error).message}`,
    };
  }
}

export async function deleteRow(
  connection: Connection,
  tableName: string,
  primaryKeyColumn: string,
  primaryKeyValue: string | number | null
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      const mysqlConnection = await mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });

      const query = `DELETE FROM \`${tableName}\` WHERE \`${primaryKeyColumn}\` = ?`;
      await mysqlConnection.execute(query, [primaryKeyValue]);
      await mysqlConnection.end();
      return { success: true, message: "Row deleted successfully." };
    } else if (connection.type === "postgresql") {
      const pgClient = new PgClient({
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
      });
      await pgClient.connect();

      const query = `DELETE FROM \"${tableName}\" WHERE \"${primaryKeyColumn}\" = $1`;
      await pgClient.query(query, [primaryKeyValue]);
      await pgClient.end();
      return { success: true, message: "Row deleted successfully." };
    } else {
      return { success: false, message: "Unsupported database type." };
    }
  } catch (error: unknown) {
    console.error("Error deleting row:", error);
    return {
      success: false,
      message: `Failed to delete row: ${(error as Error).message}`,
    };
  }
}
