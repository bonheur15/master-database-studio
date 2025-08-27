"use server";

import {
  Connection,
  TableSchema,
  TableColumn,
  CrudResult,
} from "@/types/connection";
import { deleteDoc, getCollectionDocs, insertDoc, updateDoc } from "./mongo";
import {
  deleteData,
  getTableColumns,
  getTableDatas,
  insertDatas,
  updateData,
} from "./postgres";
import {
  deleteMysqlRow,
  getMysqlData,
  insertMysqlRaw,
  updateMysqlRow,
} from "./mysql";

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
      return await getMysqlData(connection, tableName);
    } else if (connection.type === "postgresql") {
      const columnsRaw = await getTableColumns(connection, tableName);

      const columns: TableColumn[] = columnsRaw.map((col) => ({
        columnName: col.column_name,
        dataType: col.data_type,
        isNullable: col.is_nullable === "YES",
        columnKey:
          col.constraint_type === "PRIMARY KEY"
            ? "PRI"
            : col.constraint_type || "",
        defaultValue: col.column_default,
        extra: "",
      }));

      const schema: TableSchema = { tableName, columns };

      // Get data (defaulting to first 20 rows, page 1)
      const data = await getTableDatas({
        connection,
        tableName,
        limit: 20,
        page: 1,
      });

      return { success: true, data, schema };
    } else if (connection.type === "mongodb") {
      try {
        const data = await getCollectionDocs({
          collection: tableName,
          connection,
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

export async function insertRow(
  connection: Connection,
  tableName: string,
  rowData: Record<string, unknown>
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      await insertMysqlRaw(connection, tableName, rowData);
      return { success: true, message: "Row inserted successfully." };
    } else if (connection.type === "postgresql") {
      await insertDatas(connection, tableName, rowData);
      return { success: true, message: "Row inserted successfully." };
    } else if (connection.type === "mongodb") {
      await insertDoc(tableName, rowData, connection);
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
  primaryKeyValue: string | number,
  rowData: Record<string, unknown>
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      await updateMysqlRow(
        connection,
        tableName,
        primaryKeyColumn,
        primaryKeyValue,
        rowData
      );
      return { success: true, message: "Row updated successfully." };
    } else if (connection.type === "postgresql") {
      const pk = {
        [primaryKeyColumn]: primaryKeyValue,
      };
      await updateData(connection, tableName, pk, rowData);
      return { success: true, message: "Row updated successfully." };
    } else if (connection.type === "mongodb") {
      await updateDoc(
        tableName,
        primaryKeyValue?.toString(),
        rowData,
        connection
      );
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
  primaryKeyValue: string | number
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      await deleteMysqlRow(
        connection,
        tableName,
        primaryKeyColumn,
        primaryKeyValue
      );
      return { success: true, message: "Row deleted successfully." };
    } else if (connection.type === "postgresql") {
      const pk = {
        [primaryKeyColumn]: primaryKeyValue,
      };
      await deleteData(connection, tableName, pk);
      return { success: true, message: "Row deleted successfully." };
    } else if (connection.type === "mongodb") {
      await deleteDoc(tableName, primaryKeyValue?.toString(), connection);
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
