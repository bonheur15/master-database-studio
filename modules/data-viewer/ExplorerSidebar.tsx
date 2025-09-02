"use client";
import { Search, Table } from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { ConnectForm } from "../connection/ConnectForm";
import { QueryEditorDialog } from "../master-console/QueryEditorDialog";
import { ConnectionList } from "../connection/ConnectionList";
import { getMysqlTables } from "@/app/actions/tables";
import { loadConnections } from "@/lib/connection-storage";
import Link from "next/link";
import { getPgTableNames, getSchemas } from "@/app/actions/postgres";
import { getCollections } from "@/app/actions/mongo";

import SchemaOptions from "./SchemaOptions";
import { Connection } from "@/types/connection";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";

export function ExplorerSidebar() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const tableName = searchParams.get("table");
  const [connected, setConnected] = useState<Connection>();
  const [schemas, setSchema] = useState<string[]>();
  const [SelectedSchema, setSelectedSchema] = useState<string>();

  const [activeTable, setActiveTable] = useState(tableName || "");
  useEffect(() => {
    if (tableName) {
      setActiveTable(tableName);
    }
  }, [tableName]);
  const [tables, setTables] = useState<{ name: string; count: number }[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTables, setFilteredTables] = useState<
    { name: string; count: number }[]
  >([]);

  useEffect(() => {
    const filteredTables = tables.filter((table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTables(filteredTables);
  }, [searchTerm, tables]);
  useEffect(() => {
    if (schemas && schemas.length > 0 && !SelectedSchema) {
      setSelectedSchema(schemas[0]);
    }
  }, [schemas, SelectedSchema, connectionId]);
  useEffect(() => {
    const fetchSchemas = async () => {
      if (connected) {
        const schema = await getSchemas(connected);
        if (schema.success) {
          setSchema(schema.schemas);
        }
      }
    };
    fetchSchemas();
  }, [connected, connectionId]);

  useEffect(() => {
    const fetchTables = async () => {
      if (connectionId) {
        setLoadingTables(true);
        const connections = await loadConnections();
        const currentConnection = connections.find(
          (conn) => conn.id === connectionId
        );

        if (currentConnection) {
          setConnected(currentConnection);
          let result: {
            success: boolean;
            tables?: { name: string; count: number }[];
            message?: string;
          } = { success: false, message: "Connection type not supported." };
          if (currentConnection.type === "mysql") {
            result = await getMysqlTables(currentConnection);
          }
          if (currentConnection.type === "mongodb") {
            result = await getCollections(currentConnection);
          }
          if (currentConnection.type === "postgresql") {
            result = await getPgTableNames(currentConnection, SelectedSchema);
          }
          if (result.success && result.tables) {
            setTables(result.tables);
            if (result.tables?.length > 0) {
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
  }, [connectionId, tableName, SelectedSchema]);

  return (
    <div className="flex h-full flex-col gap-4 px-2 py-4 w-[100%]">
      {/* --- Connections Section --- */}
      <div className="w-[100%]">
        <h3 className="mb-2 px-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Connections {SelectedSchema}
        </h3>
        <nav className="grid gap-1 w-[100%]">
          <ConnectionList currentConnectionId={connectionId ?? ""} />
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
          <div className="px-3 py-2 text-xs font-semibold flex justify-between tracking-wider uppercase text-muted-foreground hover:no-underline">
            {connected?.type === "postgresql" ? (
              <Select
                onValueChange={(value: string) => {
                  setSelectedSchema(value);
                }}
              >
                <SelectTrigger className="w-[180px] focus:outline-none">
                  <div className="w-full border border-gray-400/50 p-2 rounded-md">
                    <SelectValue placeholder={SelectedSchema} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {schemas?.map((schema, i) => (
                      <SelectItem value={schema} key={i}>
                        {schema}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <div>tables</div>
            )}
            {connected ? (
              <SchemaOptions connection={connected} schema={SelectedSchema} />
            ) : null}
          </div>
          <AccordionContent className="pt-1 h-[100%]">
            <div className="flex flex-col gap-2 px-1 h-[100%]">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tables..."
                  className="w-full rounded-lg bg-background pl-8"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Table List */}
              <div className="flex flex-col gap-1 max-h-[40vh] w-[100%] overflow-auto">
                {loadingTables ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">
                    Loading tables...
                  </p>
                ) : filteredTables.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">
                    {connectionId
                      ? "No tables found"
                      : "Select a connection to view tables."}
                  </p>
                ) : (
                  filteredTables.map((table) => (
                    <Link
                      key={table.name}
                      href={`/studio?connectionId=${connectionId}&tableName=${
                        table.name
                      }${SelectedSchema ? `&schema=${SelectedSchema}` : ""}`}
                      onClick={() => setActiveTable(table.name)}
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
