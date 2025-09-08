"use client";

import { truncateMysqlTable } from "@/app/actions/mysql";
import { truncatePgTable } from "@/app/actions/postgres";
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
import { Scissors } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function TruncateTrigger({
  connection,
  tableName,
}: {
  connection: Connection;
  tableName: string;
}) {
  const [input, setInput] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    setConfirmed(input === tableName);
  }, [input, tableName]);

  const handleTruncate = async () => {
    if (connection.type === "mysql") {
      const result = await truncateMysqlTable(connection, tableName);
      if (result.success) {
        toast.success(result.message ?? "Table truncated successfully");
      } else {
        toast.error(result.message ?? "Failed to truncate table");
      }
    } else if (connection.type === "postgresql") {
      const result = await truncatePgTable(connection, tableName);
      if (result.success) {
        toast.success(result.message ?? "Table truncated successfully");
      } else {
        toast.error(result.message ?? "Failed to truncate table");
      }
    } else {
      toast.error("Truncate not supported for this database type");
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-red-500">Truncate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm">Truncate Table</DialogTitle>
          <DialogDescription>
            Type <span className="text-sm text-yellow-600">{tableName}</span> to
            confirm truncate. This will <b>remove all rows</b> but keep the
            table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="tableName"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleTruncate}
            className="bg-yellow-600 text-white"
            disabled={!confirmed}
          >
            Truncate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TruncateTrigger;
