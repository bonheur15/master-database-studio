import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import React from "react";
import { CreateTableDialog } from "./CreateTableDialog";
import { Connection } from "@/types/connection";
import { CreateSchemaDialog } from "./createSchema";

function SchemaOptions({
  connection,
  schema,
}: {
  connection: Connection;
  schema?: string;
}) {
  console.log("here", schema);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className="w-5 h-5">
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col  py-4 px-1  w-60">
          <CreateSchemaDialog connection={connection} />
          <CreateTableDialog connection={connection} schema={schema} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SchemaOptions;
