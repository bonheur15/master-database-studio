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
  tableName: string,
  Schema?: string
): Promise<GetTableDataResult> {
  try {
    if (connection.type === "mysql") {
      return await getMysqlData(connection, tableName);
    } else if (connection.type === "postgresql") {
      const result = await getTableColumns(connection, tableName, Schema);

      if (!result.success || !result.columns) {
        throw new Error(result.message ?? "Failed to fetch columns");
      }

      const columns: TableColumn[] = result.columns.map((col) => ({
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

      const dataResult = await getTableDatas({
        connection,
        tableName,
        schema: Schema,
        limit: 20,
        page: 1,
      });

      if (!dataResult.success || !dataResult.rows) {
        throw new Error(dataResult.message ?? "Failed to fetch table data");
      }

      return { success: true, data: dataResult.rows, schema };
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
  rowData: Record<string, unknown>,
  schema?: string
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      const result = await insertMysqlRaw(connection, tableName, rowData);
      if (result.success) {
        return { success: true, message: "Row inserted successfully." };
      } else {
        return { success: false, message: "failed to insert row." };
      }
    } else if (connection.type === "postgresql") {
      const insertResult = await insertDatas(
        connection,
        tableName,
        rowData,
        schema
      );

      if (!insertResult.success) {
        throw new Error(insertResult.message ?? "Failed to insert row");
      }

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
  rowData: Record<string, unknown>,
  schema?: string
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      const result = await updateMysqlRow(
        connection,
        tableName,
        primaryKeyColumn,
        primaryKeyValue,
        rowData
      );
      if (result.success) {
        return { success: true, message: "Row updated successfully." };
      } else {
        return {
          success: false,
          message: result.message ?? "failed to update row.",
        };
      }
    } else if (connection.type === "postgresql") {
      const pk = {
        [primaryKeyColumn]: primaryKeyValue,
      };
      const result = await updateData(
        connection,
        tableName,
        pk,
        rowData,
        schema
      );
      if (!result.success) {
        throw new Error(result.message ?? "Failed to update row");
      }
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
  primaryKeyValue: string | number,
  schema?: string
): Promise<CrudResult> {
  try {
    if (connection.type === "mysql") {
      const result = await deleteMysqlRow(
        connection,
        tableName,
        primaryKeyColumn,
        primaryKeyValue
      );
      if (result.success) {
        return { success: true, message: "Row deleted successfully." };
      } else {
        return { success: false, message: "Failed to delete row." };
      }
    } else if (connection.type === "postgresql") {
      const pk = {
        [primaryKeyColumn]: primaryKeyValue,
      };
      const deleteResult = await deleteData(connection, tableName, pk, schema);
      if (!deleteResult.success) {
        throw new Error(deleteResult.message ?? "failed to delete row");
      }

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
