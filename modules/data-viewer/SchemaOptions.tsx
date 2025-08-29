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

function SchemaOptions({ connection }: { connection: Connection }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className="w-5 h-5">
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col gap-4 py-4 px-1  w-60">
          <div>Schema</div>
          <CreateTableDialog connection={connection} />

          <div>Enum</div>
          <div>Role</div>
          <div>Policy</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SchemaOptions;
