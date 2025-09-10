"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Connection, TableSchema } from "@/types/connection";
import { insertRow } from "@/app/actions/data";

export const AddRowDialog = ({
  isOpen,
  onClose,
  schema,
  connection,
  tableName,
  Schema,
}: {
  isOpen: boolean;
  onClose: () => void;
  schema: TableSchema;
  connection: Connection;
  tableName: string;
  Schema?: string;
}) => {
  const [newRowData, setNewRowData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, unknown> = {};
      schema.columns.forEach((col) => {
        if (col.defaultValue !== null && col.defaultValue !== undefined) {
          initialData[col.columnName] = col.defaultValue;
        } else if (col.isNullable) {
          initialData[col.columnName] = null;
        } else {
          switch (col.dataType?.toLowerCase()) {
            case "int":
            case "integer":
            case "bigint":
            case "float":
            case "double":
            case "decimal":
              initialData[col.columnName] = 0;
              break;
            case "boolean":
            case "bool":
              initialData[col.columnName] = false;
              break;
            default:
              initialData[col.columnName] = "";
          }
        }
      });
      setNewRowData(initialData);
    }
  }, [isOpen, schema]);

  const handleFieldChange = (columnName: string, value: unknown) => {
    setNewRowData((prev) => ({ ...prev, [columnName]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const result = await insertRow(connection, tableName, newRowData, Schema);
      if (result.success) {
        toast.success("Row Added", { description: result.message });

        onClose();
      } else {
        toast.error("Add Row Failed", { description: result.message });
      }
    } catch (err) {
      toast.error("Add Row Error", {
        description: `An error occurred: ${(err as Error).message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Row to &quot;{tableName}&quot;</DialogTitle>
          <DialogDescription>
            Fill in the details for the new row.{Schema}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          {schema.columns.map((col) => (
            <div
              key={col.columnName}
              className="grid grid-cols-4 items-center gap-4"
            >
              <Label htmlFor={col.columnName} className="text-right">
                {col.columnName}
                {!col.isNullable && <span className="text-destructive">*</span>}
              </Label>
              <div className="col-span-3">
                <Input
                  id={col.columnName}
                  value={
                    newRowData[col.columnName] !== null &&
                    newRowData[col.columnName] !== undefined
                      ? String(newRowData[col.columnName])
                      : ""
                  }
                  onChange={(e) =>
                    handleFieldChange(col.columnName, e.target.value)
                  }
                  placeholder={col.dataType}
                  disabled={isSaving}
                />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Row"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
