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
import { PlusIcon, Table } from "lucide-react";

export function CreateTableDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-3 ">
          <PlusIcon className="h-4 w-4" />
          Create New Table
        </Button>
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
            <Input id="tableName" value="" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Table</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
