"use client";

import { useEffect, useState } from "react";
import { Connection } from "@/types/connection";
import { loadConnections, deleteConnection } from "@/lib/connection-storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw, Trash2, Database } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export function ConnectionList() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const storedConnections = await loadConnections();
      setConnections(storedConnections);
    } catch (error) {
      toast.error("Error loading connections", {
        description: "Failed to retrieve connections from local storage.",
      });
      console.error("Failed to load connections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const updatedConnections = await deleteConnection(id);
      setConnections(updatedConnections);
      toast.success("Connection Deleted", {
        description: "Connection successfully removed from vault.",
      });
    } catch (error) {
      toast.error("Error deleting connection", {
        description: "Failed to delete connection from local storage.",
      });
      console.error("Failed to delete connection:", error);
    }
  };

  return (
    <>
      {loading ? (
        <p>Loading connections...</p>
      ) : connections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No connections saved yet.
        </p>
      ) : (
        <div className="space-y-2">
          {connections.map((conn) => (
            <Link
              href={`?connectionId=${conn.id}`}
              key={conn.id}
              className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 hover:text-foreground cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{conn.name}</p>
                  <p className="text-xs text-muted-foreground ">
                    {conn.type} -{" "}
                    {conn.host?.replace(/(.{4}).+(.{4})/, "$1...$2")}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the
                      <span className="font-bold"> {conn.name} </span>{" "}
                      connection.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(conn.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
