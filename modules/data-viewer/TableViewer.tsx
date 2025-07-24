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
import * as React from "react";

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

// --- Mock Data (enhanced with status) ---
const columns = [
  { id: "id", name: "ID", type: "INT" },
  { id: "name", name: "Name", type: "VARCHAR" },
  { id: "email", name: "Email", type: "VARCHAR" },
  { id: "status", name: "Status", type: "ENUM" },
  { id: "createdAt", name: "Created At", type: "DATETIME" },
];

const initialData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    status: "active",
    createdAt: "2025-07-21",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "active",
    createdAt: "2025-07-22",
  },
  {
    id: 3,
    name: "Peter Jones",
    email: "peter.jones@example.com",
    status: "inactive",
    createdAt: "2025-07-23",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@example.com",
    status: "active",
    createdAt: "2025-07-24",
  },
];
// ---------------------------------------------

export function TableViewer() {
  const [data, setData] = React.useState(initialData);
  const [visibleColumns, setVisibleColumns] = React.useState(
    columns.map((c) => c.id)
  );
  const [selectedRows, setSelectedRows] = React.useState<number[]>([]);
  const [editingRowId, setEditingRowId] = React.useState<number | null>(null);

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? data.map((row) => row.id) : []);
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Browse, manage, and edit data in the &quot;users&quot; table.
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
              <Button variant="destructive" size="sm" className="gap-x-2">
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
                {columns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleColumns.includes(col.id)}
                    onCheckedChange={() =>
                      setVisibleColumns((prev) =>
                        prev.includes(col.id)
                          ? prev.filter((id) => id !== col.id)
                          : [...prev, col.id]
                      )
                    }
                  >
                    {col.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="gap-x-2">
              <PlusCircle className="h-4 w-4" /> Add Row
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="h-9 w-9">
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
                {columns
                  .filter((c) => visibleColumns.includes(c.id))
                  .map((col) => (
                    <TableHead key={col.id}>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        {col.name}
                        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableHead>
                  ))}
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedRows.includes(row.id) && "selected"}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => handleSelectRow(row.id)}
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                  {columns
                    .filter((c) => visibleColumns.includes(c.id))
                    .map((col) => (
                      <TableCell key={col.id}>
                        {editingRowId === row.id ? (
                          <Input
                            defaultValue={row[col.id as keyof typeof row]}
                            className="h-8"
                          />
                        ) : col.id === "status" ? (
                          <Badge
                            variant={
                              row.status === "active" ? "default" : "secondary"
                            }
                          >
                            {row.status}
                          </Badge>
                        ) : (
                          row[col.id as keyof typeof row]
                        )}
                      </TableCell>
                    ))}
                  <TableCell className="text-right">
                    {editingRowId === row.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingRowId(null)}
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
                            onClick={() => setEditingRowId(row.id)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit Row
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Row
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} of {data.length} row(s) selected.
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
