import { Database, PlusCircle, Search, Table } from "lucide-react";
import React, { useState, useEffect, use } from "react";
import { cn } from "@/lib/utils"; // Make sure you have a cn utility
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateTableDialog } from "./CreateTableDialog";
import { ConnectForm } from "../connection/ConnectForm";
import { QueryEditorDialog } from "../master-console/QueryEditorDialog";
import { ConnectionList } from "../connection/ConnectionList";
import { getMysqlTables } from "@/app/actions/tables";
import { loadConnections } from "@/lib/connection-storage";
import Link from "next/link";

export function ExplorerSidebar() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const tableName = searchParams.get("table");

  const [activeTable, setActiveTable] = useState(tableName || "");
  useEffect(() => {
    if (tableName) {
      setActiveTable(tableName);
    }
  }, [tableName]);
  const [tables, setTables] = useState<{ name: string; count: number }[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      if (connectionId) {
        setLoadingTables(true);
        const connections = await loadConnections();
        const currentConnection = connections.find(
          (conn) => conn.id === connectionId
        );

        if (currentConnection) {
          const result = await getMysqlTables(currentConnection);
          if (result.success && result.tables) {
            setTables(result.tables);
            if (result.tables.length > 0) {
              setActiveTable(result.tables[0].name);
            }
          } else {
            toast.error("Failed to load tables", {
              description: result.message || "An unknown error occurred.",
            });
            setTables([]);
          }
        } else {
          toast.error("Connection not found", {
            description: "The selected connection could not be found.",
          });
          setTables([]);
        }
        setLoadingTables(false);
      } else {
        setTables([]);
      }
    };
    fetchTables();
  }, [connectionId]);

  return (
    <div className="flex h-full flex-col gap-4 px-2 py-4">
      {/* --- Connections Section --- */}
      <div>
        <h3 className="mb-2 px-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Connections
        </h3>
        <nav className="grid gap-1">
          <ConnectionList />
          <ConnectForm />
        </nav>
      </div>

      {/* --- Tables Section (Collapsible) --- */}
      <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="w-full h-[100%] "
      >
        <AccordionItem value="item-1" className="border-b-0 h-[100%]">
          <AccordionTrigger className="px-3 py-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:no-underline">
            <div className="flex-1 text-left">Tables</div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 h-[100%]">
            <div className="flex flex-col gap-2 px-1 h-[100%]">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tables..."
                  className="w-full rounded-lg bg-background pl-8"
                />
              </div>

              {/* Create Table Button */}
              <CreateTableDialog />

              {/* Table List */}
              <div className="flex flex-col gap-1 max-h-[40vh] w-[100%] overflow-auto">
                {loadingTables ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">
                    Loading tables...
                  </p>
                ) : tables.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">
                    {connectionId
                      ? "No tables found"
                      : "Select a connection to view tables."}
                  </p>
                ) : (
                  tables.map((table) => (
                    <Link
                      key={table.name}
                      href={`?connectionId=${connectionId}&table=${table.name}`}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground",
                        activeTable === table.name &&
                          "bg-muted/90 font-medium text-foreground dark:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        <span>
                          {table.name.length > 14
                            ? `${table.name.slice(0, 14)}...`
                            : table.name}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {table.count.toLocaleString()}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <QueryEditorDialog />
    </div>
  );
}
