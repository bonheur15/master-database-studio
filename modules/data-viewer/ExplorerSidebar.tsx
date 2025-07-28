import { Database, PlusCircle, Search, Table } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils"; // Make sure you have a cn utility

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

const tables = [
  { id: "users", name: "users", count: 120, icon: Table },
  { id: "products", name: "products", count: 584, icon: Table },
  { id: "orders", name: "orders", count: 1250, icon: Table },
  { id: "reviews", name: "reviews", count: 78, icon: Table },
];
// -------------------------------------------------------------

export function ExplorerSidebar() {
  const [activeTable, setActiveTable] = React.useState("users");

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
        className="w-full"
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="px-3 py-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:no-underline">
            <div className="flex-1 text-left">Tables</div>
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="flex flex-col gap-2 px-1">
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
              <div className="flex flex-col gap-1">
                {tables.map((table) => (
                  <a
                    key={table.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTable(table.id);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground",
                      activeTable === table.id &&
                        "bg-muted/90 font-medium text-foreground dark:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <table.icon className="h-4 w-4" />
                      <span>{table.name}</span>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {table.count.toLocaleString()}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <QueryEditorDialog />
    </div>
  );
}
