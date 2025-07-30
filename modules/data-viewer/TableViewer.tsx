"use client";

import {
  ArrowUpDown,
  EyeOff,
  ListFilter,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RotateCw,
  Search,
  Trash2,
  X,
  Check,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Connection, TableSchema, TableColumn } from "@/types/connection";
import { loadConnections } from "@/lib/connection-storage";
import {
  getTableData,
  insertRow,
  updateRow,
  deleteRow,
} from "@/app/actions/data";
import dynamic from "next/dynamic";

const JsonViewer = dynamic(() => import("./JsonViewer"), { ssr: false });

export function TableViewer() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const tableName = searchParams.get("tableName");

  const [connection, setConnection] = useState<Connection | null>(null);
  const [tableData, setTableData] = useState<
    Record<string, string | number | boolean | null>[]
  >([]);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<
    Record<string, string | number | boolean | null>
  >({});

  const fetchTableData = useCallback(async () => {
    console.log("Fetching table data for:", connectionId, tableName);
    if (!connectionId || !tableName) {
      setLoading(false);
      setError("No connection or table selected.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const connections = await loadConnections();
      const currentConnection = connections.find(
        (conn) => conn.id === connectionId
      );

      if (!currentConnection) {
        setError("Connection not found.");
        setLoading(false);
        return;
      }
      setConnection(currentConnection);

      const result = await getTableData(currentConnection, tableName);
      if (result.success && result.data) {
        setTableData(
          result.data as Record<string, string | number | boolean | null>[]
        );
        if (result.schema) {
          setTableSchema(result.schema);
          setVisibleColumns(result.schema.columns.map((col) => col.columnName));
        }
      } else {
        setError(result.message || "Failed to fetch table data.");
        setTableData([]);
        setTableSchema(null);
      }
    } catch (err) {
      setError(`An error occurred: ${(err as Error).message}`);
      setTableData([]);
      setTableSchema(null);
    } finally {
      setLoading(false);
    }
  }, [connectionId, tableName]);

  useEffect(() => {
    fetchTableData();
  }, [connectionId, fetchTableData, tableName]);

  const handleSelectAll = (checked: boolean) => {
    if (
      tableSchema &&
      tableSchema.columns.some((col) => col.columnKey === "PRI")
    ) {
      const primaryKeyColumn = tableSchema.columns.find(
        (col) => col.columnKey === "PRI"
      )?.columnName;
      if (primaryKeyColumn) {
        setSelectedRows(
          checked && primaryKeyColumn
            ? tableData.map((row) => row[primaryKeyColumn]?.toString() || "")
            : []
        );
      }
    } else {
      // Fallback if no primary key, or handle as an error/unsupported
      toast.info("Cannot select all rows", {
        description: "Table has no primary key defined.",
      });
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    tableData.length > 0 && selectedRows.length === tableData.length;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < tableData.length;

  const handleEditClick = (
    row: Record<string, string | number | boolean | null>
  ) => {
    if (
      tableSchema &&
      tableSchema.columns.some((col) => col.columnKey === "PRI")
    ) {
      const primaryKeyColumn = tableSchema.columns.find(
        (col) => col.columnKey === "PRI"
      )?.columnName;
      if (primaryKeyColumn) {
        setEditingRowId(
          row[primaryKeyColumn] ? row[primaryKeyColumn].toString() : ""
        );
        setEditingRowData({ ...row });
      } else {
        toast.error("Edit Error", {
          description: "Table has no primary key defined for editing.",
        });
      }
    } else {
      toast.error("Edit Error", {
        description: "Table has no primary key defined for editing.",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!connection || !tableName || !tableSchema || !editingRowId) return;

    const primaryKeyColumn = tableSchema.columns.find(
      (col) => col.columnKey === "PRI"
    )?.columnName;
    if (!primaryKeyColumn) {
      toast.error("Save Error", {
        description: "Table has no primary key defined.",
      });
      return;
    }

    try {
      const result = await updateRow(
        connection,
        tableName,
        primaryKeyColumn,
        typeof editingRowData[primaryKeyColumn] === "boolean"
          ? null
          : editingRowData[primaryKeyColumn],
        editingRowData
      );
      if (result.success) {
        toast.success("Row Updated", { description: result.message });
        setEditingRowId(null);
        setEditingRowData({});
        fetchTableData(); // Refresh data
      } else {
        toast.error("Update Failed", { description: result.message });
      }
    } catch (err) {
      toast.error("Update Error", {
        description: `An error occurred: ${(err as Error).message}`,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!connection || !tableName || !tableSchema) return;

    const primaryKeyColumn = tableSchema.columns.find(
      (col) => col.columnKey === "PRI"
    )?.columnName;
    if (!primaryKeyColumn) {
      toast.error("Delete Error", {
        description: "Table has no primary key defined.",
      });
      return;
    }

    try {
      const result = await deleteRow(
        connection,
        tableName,
        primaryKeyColumn,
        rowId
      );
      if (result.success) {
        toast.success("Row Deleted", { description: result.message });
        fetchTableData(); // Refresh data
      } else {
        toast.error("Delete Failed", { description: result.message });
      }
    } catch (err) {
      toast.error("Delete Error", {
        description: `An error occurred: ${(err as Error).message}`,
      });
    }
  };

  const handleAddRow = async () => {
    if (!connection || !tableName || !tableSchema) return;

    // For simplicity, let's assume we are adding an empty row or a row with default values
    // In a real app, you'd open a dialog for user input
    const newRowData: Record<string, unknown> = {};
    tableSchema.columns.forEach((col) => {
      // Set default values or null based on schema
      if (col.defaultValue !== null) {
        newRowData[col.columnName] = col.defaultValue;
      } else if (col.isNullable) {
        newRowData[col.columnName] = null;
      } else {
        // For non-nullable columns without default, provide a placeholder or empty string
        newRowData[col.columnName] = "";
      }
    });

    try {
      const result = await insertRow(connection, tableName, newRowData);
      if (result.success) {
        toast.success("Row Added", { description: result.message });
        fetchTableData(); // Refresh data
      } else {
        toast.error("Add Row Failed", { description: result.message });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Add Row Error", {
          description: `An error occurred: ${err.message}`,
        });
      } else {
        toast.error("Add Row Error", {
          description: "An unknown error occurred.",
        });
      }
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <RotateCw className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading table data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={fetchTableData} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  if (!tableName || !connectionId) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          Select a connection and table from the sidebar to view data.
        </p>
      </Card>
    );
  }

  if (!tableData) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          No schema or data available for this table.
        </p>
      </Card>
    );
  }

  if (connection?.type === "mongodb") {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{tableName}</CardTitle>
          <CardDescription>
            Viewing documents in the &quot;{tableName}&quot; collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <JsonViewer data={tableData} />
        </CardContent>
      </Card>
    );
  }

  if (!tableSchema) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          No schema available for this table.
        </p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{tableName}</CardTitle>
          <CardDescription>
            Browse, manage, and edit data in the &quot;{tableName}&quot; table.
          </CardDescription>
        </CardHeader>

        {/* --- Unified Toolbar --- */}
        <div className="flex items-center justify-between gap-2 px-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search data..." className="pl-8 w-64" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-x-2">
                  <ListFilter className="h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {/* Add filter options here */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-x-2"
                onClick={() => {
                  // Implement bulk delete here
                  toast.info("Bulk Delete", {
                    description: `Deleting ${selectedRows.length} rows.`,
                  });
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete ({selectedRows.length})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-x-2">
                  <EyeOff className="h-4 w-4" /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tableSchema.columns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.columnName}
                    checked={visibleColumns.includes(col.columnName)}
                    onCheckedChange={() =>
                      setVisibleColumns((prev) =>
                        prev.includes(col.columnName)
                          ? prev.filter((id) => id !== col.columnName)
                          : [...prev, col.columnName]
                      )
                    }
                  >
                    {col.columnName}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              className="gap-x-2"
              onClick={handleAddRow}
            >
              <PlusCircle className="h-4 w-4" /> Add Row
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9"
                  onClick={fetchTableData}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <CardContent className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                    data-state={
                      isIndeterminate
                        ? "indeterminate"
                        : isAllSelected
                        ? "checked"
                        : "unchecked"
                    }
                  />
                </TableHead>
                {tableSchema.columns
                  .filter((c) => visibleColumns.includes(c.columnName))
                  .map((col) => (
                    <TableHead key={col.columnName}>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        {col.columnName}
                        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableHead>
                  ))}
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => {
                const primaryKeyColumn = tableSchema.columns.find(
                  (col) => col.columnKey === "PRI"
                )?.columnName;
                const rowId =
                  primaryKeyColumn && row[primaryKeyColumn] !== null
                    ? row[primaryKeyColumn]?.toString()
                    : JSON.stringify(row); // Fallback if no PK

                return (
                  <TableRow
                    key={rowId}
                    data-state={selectedRows.includes(rowId) && "selected"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(rowId)}
                        onCheckedChange={() => handleSelectRow(rowId)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </TableCell>
                    {tableSchema.columns
                      .filter((c) => visibleColumns.includes(c.columnName))
                      .map((col) => (
                        <TableCell key={col.columnName}>
                          {editingRowId === rowId ? (
                            <Input
                              value={String(editingRowData[col.columnName])}
                              onChange={(e) =>
                                setEditingRowData({
                                  ...editingRowData,
                                  [col.columnName]: e.target.value,
                                })
                              }
                              className="h-8"
                            />
                          ) : (
                            row[col.columnName]?.toString()
                          )}
                        </TableCell>
                      ))}
                    <TableCell className="text-right">
                      {editingRowId === rowId ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleSaveEdit}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(row)}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit Row
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeleteRow(rowId)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Row
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} of {tableData.length} row(s) selected.
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
              <Button size="sm" variant="outline">
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
