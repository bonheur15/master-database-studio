import { deleteCollections } from "@/app/actions/mongo";
import { deleteMysqlTable } from "@/app/actions/mysql";
import { deletePgTable } from "@/app/actions/postgres";
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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function DeleteTriger({
  connection,
  tableName,
}: {
  connection: Connection;
  tableName: string;
}) {
  const [table, setTable] = useState<string>();
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (table === tableName) {
      setConfirmed(true);
    }
  }, [table, tableName]);
  const handleDelete = async () => {
    if (connection.type === "mongodb") {
      const result = await deleteCollections({
        collection: tableName,
        connection: connection,
      });
      if (result.success) {
        toast.success(result.message ?? "collection deleted successdfully");
      } else {
        toast.error(result.message ?? "Failed to delete collection");
      }
    } else if (connection.type === "mysql") {
      const result = await deleteMysqlTable(connection, tableName);
      if (result.success) {
        toast.success(result.message ?? "collection deleted successdfully");
      } else {
        toast.error(result.message ?? "Failed to delete collection");
      }
    } else if (connection.type === "postgresql") {
      const result = await deletePgTable(connection, tableName);
      if (result.success) {
        toast.success(result.message ?? "collection deleted successdfully");
      } else {
        toast.error(result.message ?? "Failed to delete collection");
      }
    }
  };
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="w-6 text-xs bg-red-600 hover:bg-red-500 cursor-pointer h-5 ">
          Drop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm">Delete collection</DialogTitle>
          <DialogDescription>
            Type <span className="text-sm text-red-600">{tableName}</span> to
            confirm delete
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
          <Button
            type="submit"
            onClick={handleDelete}
            className="bg-red-600 text-white"
            disabled={confirmed ? false : true}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteTriger;
