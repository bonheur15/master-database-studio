"use client";
import { createMysqlTable } from "@/app/actions/mysql";
import { createTable } from "@/app/actions/postgres";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Connection } from "@/types/connection";
import { useState } from "react";
import { toast } from "sonner";

export function CreateTableDialog({
  connection,
  schema,
}: {
  connection: Connection;
  schema?: string;
}) {
  const [table, setTable] = useState<string>("");
  const handleSubmit = async () => {
    if (connection.type === "postgresql") {
      const result = await createTable(connection, table, schema);
      if (result.success) {
        toast.success(result.message ?? "Table create successfully");
      } else {
        toast.error(result.message ?? "failed to create table");
      }
    } else {
      const result = await createMysqlTable(connection, table);
      toast.success("table created");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:bg-primary/10 p-2 rounded-md">
          Add table
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Create Table{" "}
            {schema ? (
              <span>
                {" "}
                to <span className="text-red-500">{schema}</span> schema
              </span>
            ) : (
              ""
            )}
          </DialogTitle>
          <DialogDescription>
            Enter the name for your new table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="  items-center gap-4">
            <Input
              id="tableName"
              value={table}
              className="col-span-3"
              onChange={(e) => setTable(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Create Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
