"use client";

import {
  ArrowUpDown,
  EyeOff,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RotateCw,
  Search,
  Trash2,
  X,
  Check,
  XCircle,
  Database,
  TableProperties,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";

import { Connection, TableSchema, TableColumn } from "@/types/connection";
import { loadConnections } from "@/lib/connection-storage";
import {
  getTableData,
  insertRow,
  updateRow,
  deleteRow,
} from "@/app/actions/data";
import dynamic from "next/dynamic";
import { AddRowDialog } from "./AddRowDialog";
import AddColumnDialog from "./AddColumn";
import { getSchemas } from "@/app/actions/postgres";

const JsonViewer = dynamic(() => import("./JsonViewer"), { ssr: false });

export function TableViewer() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const tableName = searchParams.get("tableName");

  const [connection, setConnection] = useState<Connection | null>(null);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<Record<string, any>>({});
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{
    open: boolean;
    rowIds: string[];
    isBulk: boolean;
  }>({ open: false, rowIds: [], isBulk: false });

  // Data processing state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTableData = useCallback(async () => {
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
      if (!currentConnection) throw new Error("Connection not found.");
      setConnection(currentConnection);

      const result = await getTableData(currentConnection, tableName);
      if (result.success && result.data) {
        setTableData(result.data);
        if (result.schema) {
          setTableSchema(result.schema);
          setVisibleColumns(result.schema.columns.map((col) => col.columnName));
        }
      } else {
        throw new Error(result.message || "Failed to fetch table data.");
      }
    } catch (err) {
      setError((err as Error).message);
      setTableData([]);
      setTableSchema(null);
    } finally {
      setLoading(false);
      setSelectedRows([]);
    }
  }, [connectionId, tableName]);

  if (connection) {
    console.log("hello from table", connection);
  }

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const primaryKeyColumn = useMemo(
    () =>
      tableSchema?.columns.find((col) => col.columnKey === "PRI")?.columnName,
    [tableSchema]
  );

  const handleSelectAll = (checked: boolean) => {
    if (!primaryKeyColumn) {
      toast.info("Cannot select all rows", {
        description: "Table has no primary key defined.",
      });
      return;
    }
    setSelectedRows(
      checked
        ? processedData.map((row) => row[primaryKeyColumn]?.toString())
        : []
    );
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSort = (columnName: string) => {
    setSortConfig((prev) => {
      const isAsc = prev?.key === columnName && prev.direction === "asc";
      return { key: columnName, direction: isAsc ? "desc" : "asc" };
    });
  };

  const processedData = useMemo(() => {
    let filteredData = [...tableData];
    if (searchTerm) {
      filteredData = filteredData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filteredData;
  }, [tableData, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  const handleEditClick = (row: Record<string, any>) => {
    if (!primaryKeyColumn) {
      toast.error("Edit Error", {
        description: "Table has no primary key defined for editing.",
      });
      return;
    }
    setEditingRowId(row[primaryKeyColumn]?.toString());
    setEditingRowData({ ...row });
  };

  const handleSaveEdit = async () => {
    if (!connection || !tableName || !primaryKeyColumn || !editingRowId) return;

    try {
      const result = await updateRow(
        connection,
        tableName,
        primaryKeyColumn,
        editingRowId,
        editingRowData
      );
      if (result.success) {
        toast.success("Row Updated", { description: result.message });
        setEditingRowId(null);
        fetchTableData();
      } else {
        toast.error("Update Failed", { description: result.message });
      }
    } catch (err) {
      toast.error("Update Error", {
        description: `An error occurred: ${(err as Error).message}`,
      });
    }
  };

  const handleDeleteRequest = (rowIds: string[]) => {
    if (!primaryKeyColumn) {
      toast.error("Delete Error", {
        description: "Table has no primary key defined.",
      });
      return;
    }
    setDeleteAlert({ open: true, rowIds, isBulk: rowIds.length > 1 });
  };

  const performDelete = async () => {
    if (!connection || !tableName || !primaryKeyColumn) return;

    const { rowIds } = deleteAlert;
    const promises = rowIds.map((id) =>
      deleteRow(connection, tableName, primaryKeyColumn, id)
    );
    const results = await Promise.all(promises);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(`Successfully deleted ${successCount} row(s).`);
      fetchTableData();
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} row(s).`);
    }
    setDeleteAlert({ open: false, rowIds: [], isBulk: false });
  };

  if (loading) {
    return (
      <EmptyState
        icon={RotateCw}
        title="Loading Data"
        description="Fetching table data, please wait..."
        action={
          <Button variant="outline" onClick={fetchTableData}>
            Retry
          </Button>
        }
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={XCircle}
        title="Notice"
        description={`Failed to load data: ${error}`}
        action={<Button onClick={fetchTableData}>Retry</Button>}
      />
    );
  }

  if (!connectionId) {
    return (
      <EmptyState
        icon={Database}
        title="No Connection Selected"
        description="Please select a database connection from the sidebar to view its tables."
      />
    );
  }

  if (!tableName) {
    return (
      <EmptyState
        icon={Table}
        title="No Table Selected"
        description="Select a table from the sidebar to view its data."
      />
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
      <EmptyState
        icon={TableProperties}
        title="No Schema Available"
        description="Could not retrieve schema for this table. It might be empty or inaccessible."
      />
    );
  }

  const isAllOnPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(row[primaryKeyColumn!]));
  const isAnyOnPageSelected = paginatedData.some((row) =>
    selectedRows.includes(row[primaryKeyColumn!])
  );

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{tableName}</CardTitle>
          <CardDescription>
            Browse, manage, and edit data in the &quot;{tableName}&quot; table.
          </CardDescription>
        </CardHeader>

        <div className="flex items-center justify-between gap-2 px-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-x-2"
                onClick={() => handleDeleteRequest(selectedRows)}
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
              onClick={() => setIsAddRowDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" /> Add Row
            </Button>
            {connection ? (
              <AddColumnDialog
                connection={connection}
                dialect={connection.type}
                tableName={tableName}
              />
            ) : (
              ""
            )}
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
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={isAllOnPageSelected}
                    onCheckedChange={(checked) => {
                      if (!primaryKeyColumn) return;
                      const pageIds = paginatedData.map(
                        (r) => r[primaryKeyColumn]
                      );
                      if (checked) {
                        setSelectedRows((prev) => [
                          ...new Set([...prev, ...pageIds]),
                        ]);
                      } else {
                        setSelectedRows((prev) =>
                          prev.filter((id) => !pageIds.includes(id))
                        );
                      }
                    }}
                    aria-label="Select all rows on this page"
                    data-state={
                      isAllOnPageSelected
                        ? "checked"
                        : isAnyOnPageSelected
                        ? "indeterminate"
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
                        onClick={() => handleSort(col.columnName)}
                      >
                        {col.columnName}
                        <ArrowUpDown
                          className={cn(
                            "ml-2 h-4 w-4 text-muted-foreground",
                            sortConfig?.key === col.columnName &&
                              "text-foreground"
                          )}
                        />
                      </Button>
                    </TableHead>
                  ))}
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => {
                const rowId = primaryKeyColumn
                  ? row[primaryKeyColumn]?.toString()
                  : JSON.stringify(row);
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
                        <TableCell
                          key={col.columnName}
                          className="max-w-xs truncate"
                        >
                          {editingRowId === rowId ? (
                            <Input
                              value={editingRowData[col.columnName] ?? ""}
                              onChange={(e) =>
                                setEditingRowData((prev) => ({
                                  ...prev,
                                  [col.columnName]: e.target.value,
                                }))
                              }
                              className="h-8"
                            />
                          ) : (
                            <span title={String(row[col.columnName])}>
                              {row[col.columnName]?.toString()}
                            </span>
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
                            onClick={() => setEditingRowId(null)}
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
                              onClick={() => handleDeleteRequest([rowId])}
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
              {selectedRows.length} of {processedData.length} row(s) selected.
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page">Rows per page</Label>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="rows-per-page" className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {connection && tableSchema && (
        <AddRowDialog
          isOpen={isAddRowDialogOpen}
          onClose={() => setIsAddRowDialogOpen(false)}
          schema={tableSchema}
          connection={connection}
          tableName={tableName!}
          onSuccess={fetchTableData}
        />
      )}

      <AlertDialog
        open={deleteAlert.open}
        onOpenChange={(open) =>
          !open && setDeleteAlert({ open: false, rowIds: [], isBulk: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {deleteAlert.rowIds.length} row(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDelete}
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
