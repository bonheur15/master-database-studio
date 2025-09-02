"use server";

import { mysqlConnector } from "@/lib/adapters/mysql";
import {
  buildSQL,
  generatMysqlDummyColumnName,
  sanitizeIdentifier,
} from "@/lib/helpers/helpers";
import {
  ColumnOptions,
  Connection,
  TableColumn,
  TableSchema,
} from "@/types/connection";

export async function getMysqlData(
  connection: Connection,
  tableName: string
): Promise<{
  success: boolean;
  data?: Record<string, unknown>[];
  schema?: TableSchema;
  message?: string;
}> {
  let mysqlConnection;
  try {
    mysqlConnection = await mysqlConnector(connection);

    // Validate identifier to prevent SQL injection
    const isValidIdent = (name: string) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    if (!isValidIdent(tableName)) {
      return { success: false, message: "Invalid table name." };
    }

    // Fetch schema info
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

    // Fetch data safely
    const [dataRows] = await mysqlConnection.execute(
      `SELECT * FROM \`${tableName}\``
    );

    return {
      success: true,
      data: dataRows as Record<string, unknown>[],
      schema,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching MySQL data:", error.message);
      return {
        success: false,
        message: `Failed to fetch data: ${error.message}`,
      };
    }
    console.error("Unknown error fetching MySQL data:", error);
    return {
      success: false,
      message: "Failed to fetch data due to an unknown error.",
    };
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end().catch((endErr: unknown) => {
        if (endErr instanceof Error) {
          console.error("Error closing MySQL connection:", endErr.message);
        } else {
          console.error("Unknown error closing MySQL connection:", endErr);
        }
      });
    }
  }
}

export async function insertMysqlRaw(
  connection: Connection,
  tableName: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  let mysqlConnection;
  try {
    mysqlConnection = await mysqlConnector(connection);

    const isValidIdent = (name: string) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

    if (!isValidIdent(tableName)) {
      return { success: false, message: "Invalid table name." };
    }

    const columns = Object.keys(data).map(sanitizeIdentifier);
    if (columns.length === 0) {
      return { success: false, message: "No data provided for insertion." };
    }

    const values = Object.values(data);
    const placeholders = columns.map(() => "?").join(", ");

    const query = `INSERT INTO \`${sanitizeIdentifier(
      tableName
    )}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders})`;

    await mysqlConnection.execute(query, values);

    return { success: true, message: "Row inserted successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error inserting MySQL data:", error.message);
      return { success: false, message: `Insert failed: ${error.message}` };
    }
    console.error("Unknown error inserting MySQL data:", error);
    return {
      success: false,
      message: "Insert failed due to an unknown error.",
    };
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end().catch((endErr: unknown) => {
        if (endErr instanceof Error) {
          console.error("Error closing MySQL connection:", endErr.message);
        } else {
          console.error("Unknown error closing MySQL connection:", endErr);
        }
      });
    }
  }
}

export async function deleteMysqlRow(
  connection: Connection,
  tableName: string,
  primaryKeyColumn: string,
  primaryKeyValue: string | number
): Promise<{ success: boolean; message: string }> {
  let mysqlConnection;
  try {
    mysqlConnection = await mysqlConnector(connection);

    const isValidIdent = (name: string) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

    if (!isValidIdent(tableName)) {
      return { success: false, message: "Invalid table name." };
    }
    if (!isValidIdent(primaryKeyColumn)) {
      return { success: false, message: "Invalid primary key column." };
    }

    const query = `DELETE FROM \`${tableName}\` WHERE \`${primaryKeyColumn}\` = ?`;
    const [result] = await mysqlConnection.execute(query, [primaryKeyValue]);

    return { success: true, message: "Row deleted successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting MySQL row:", error.message);
      return { success: false, message: `Delete failed: ${error.message}` };
    }
    console.error("Unknown error deleting MySQL row:", error);
    return {
      success: false,
      message: "Delete failed due to an unknown error.",
    };
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end().catch((endErr: unknown) => {
        if (endErr instanceof Error) {
          console.error("Error closing MySQL connection:", endErr.message);
        } else {
          console.error("Unknown error closing MySQL connection:", endErr);
        }
      });
    }
  }
}

export async function updateMysqlRow(
  connection: Connection,
  tableName: string,
  primaryKeyColumn: string,
  primaryKeyValue: string | number,
  rowData: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  let mysqlConnection;
  try {
    mysqlConnection = await mysqlConnector(connection);

    const isValidIdent = (name: string) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

    if (!isValidIdent(tableName)) {
      return { success: false, message: "Invalid table name." };
    }
    if (!isValidIdent(primaryKeyColumn)) {
      return { success: false, message: "Invalid primary key column." };
    }
    if (!rowData || Object.keys(rowData).length === 0) {
      return { success: false, message: "No data provided to update." };
    }

    const updates = Object.keys(rowData)
      .map((col) => {
        if (!isValidIdent(col)) throw new Error(`Invalid column name: ${col}`);
        return `\`${col}\` = ?`;
      })
      .join(", ");

    const values = [...Object.values(rowData), primaryKeyValue];
    const query = `UPDATE \`${tableName}\` SET ${updates} WHERE \`${primaryKeyColumn}\` = ?`;

    await mysqlConnection.execute(query, values);

    return { success: true, message: "Row updated successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating MySQL row:", error.message);
      return { success: false, message: `Update failed: ${error.message}` };
    }
    console.error("Unknown error updating MySQL row:", error);
    return {
      success: false,
      message: "Update failed due to an unknown error.",
    };
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end().catch((endErr: unknown) => {
        if (endErr instanceof Error) {
          console.error("Error closing MySQL connection:", endErr.message);
        } else {
          console.error("Unknown error closing MySQL connection:", endErr);
        }
      });
    }
  }
}

export async function addMysqlColumn(
  connection: Connection,
  columns: ColumnOptions[],
  tableName: string
): Promise<{ success: boolean; message: string }> {
  let client;
  try {
    client = await mysqlConnector(connection);

    const isValidIdent = (name: string) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

    if (!isValidIdent(tableName)) {
      return { success: false, message: "Invalid table name." };
    }
    if (!columns || columns.length === 0) {
      return { success: false, message: "No column definitions provided." };
    }

    const query = buildSQL(columns, "mysql", tableName);
    console.log("Generated MySQL query:", query);

    await client.query(query);

    return { success: true, message: "Column(s) added successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding MySQL column:", error.message);
      return { success: false, message: `Add column failed: ${error.message}` };
    }
    console.error("Unknown error adding MySQL column:", error);
    return {
      success: false,
      message: "Add column failed due to unknown error.",
    };
  } finally {
    if (client) {
      await client.end().catch((endErr: unknown) => {
        if (endErr instanceof Error) {
          console.error("Error closing MySQL connection:", endErr.message);
        } else {
          console.error("Unknown error closing MySQL connection:", endErr);
        }
      });
    }
  }
}

export async function createMysqlTable(
  connection: Connection,
  tableName: string
): Promise<{ success: boolean; message: string }> {
  let client;
  try {
    client = await mysqlConnector(connection);

    const isValidIdent = (name: string) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);

    if (!isValidIdent(tableName)) {
      return { success: false, message: "Invalid table name." };
    }

    const dummyColumn = generatMysqlDummyColumnName();
    if (!isValidIdent(dummyColumn)) {
      return { success: false, message: "Invalid dummy column name." };
    }

    const query = `CREATE TABLE \`${tableName}\` (\`${dummyColumn}\` TINYINT NULL)`;
    console.log("Generated MySQL query:", query);

    await client.execute(query);

    return { success: true, message: "Table created successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating MySQL table:", error.message);
      return {
        success: false,
        message: `Table creation failed: ${error.message}`,
      };
    }
    console.error("Unknown error creating MySQL table:", error);
    return {
      success: false,
      message: "Table creation failed due to unknown error.",
    };
  } finally {
    if (client) {
      await client.end().catch((endErr: unknown) => {
        if (endErr instanceof Error) {
          console.error("Error closing MySQL connection:", endErr.message);
        } else {
          console.error("Unknown error closing MySQL connection:", endErr);
        }
      });
    }
  }
}
