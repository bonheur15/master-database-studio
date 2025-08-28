"use client";
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
import { Label } from "@/components/ui/label";
import { Connection } from "@/types/connection";
import { PlusIcon, Table } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateTableDialog({ connection }: { connection: Connection }) {
  const [table, setTable] = useState<string>("");
  const handleSubmit = () => {
    const results = createTable(connection, table);
    toast.success("created");
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
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>
            Enter the name for your new table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right">
              Table Name
            </Label>
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
