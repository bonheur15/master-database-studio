"use client";

import React, { useEffect } from "react";
import JsonView from "react18-json-view";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Connection, jsonPayload } from "@/types/connection";
import { deleteRow, insertRow, updateRow } from "@/app/actions/data";
import { buildFullPath } from "@/lib/helpers/helpers";
import { insertDoc, unsetDocField } from "@/app/actions/mongo";

interface JsonViewerProps {
  data: any;
  connection: Connection;
  tableName: string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  connection,
  tableName,
}) => {
  const [mounted, SetMounted] = React.useState(false);

  const handleEdit = async (params: any) => {
    const { indexOrName, newValue, parentPath, parentType }: jsonPayload =
      params;
    console.log("edit event", params);

    const fullPath = await buildFullPath(indexOrName, parentPath, parentType);

    const targetDoc = data[parentPath[0]];

    const id = targetDoc ? targetDoc._id : undefined;

    try {
      if (!id) {
        const result = await insertRow(connection, tableName, {
          [fullPath]: newValue,
        });
        if (result.success) {
          toast.success(result.message ?? "Document inserted");
        } else {
          toast.error(result.message ?? "Failed to insert document");
        }
      } else {
        const result = await updateRow(connection, tableName, "_id", id, {
          [fullPath]: newValue, // use full path here
        });
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } catch {
      toast.error("Failed to update document");
    }
  };

  const handleDelete = async (params: any) => {
    const { indexOrName, value, parentPath, parentType }: jsonPayload = params;
    console.log("edit event", params);
    const fullPath = await buildFullPath(indexOrName, parentPath, parentType);
    console.log("one path", fullPath);

    const targetDoc = data[parentPath[0]];

    const id = targetDoc ? targetDoc._id : undefined;

    try {
      if (parentPath.length > 1) {
        const result = await unsetDocField(tableName, id, fullPath, connection);
        if (result.success) {
          toast.success(result.message ?? "Field removed");
        } else {
          toast.error(result.message ?? "Failed to remove field");
        }
      } else {
        const docId = value?._id;

        if (!docId) {
          throw new Error("no _id present");
        }
        const result = await deleteRow(connection, tableName, "_id", docId);
        if (result.success) {
          toast.success(result.message ?? "Doc deleted successfully");
        } else {
          toast.error(result.message ?? "Failed to delete doc");
        }
      }
    } catch {
      toast.error("Failed to delete  document");
    }
  };
  useEffect(() => {
    SetMounted(true);
  }, []);

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 text-black dark:text-white">
      {mounted && (
        <JsonView
          src={data as object}
          editable
          onAdd={handleEdit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          theme="winter-is-coming"
          enableClipboard
        />
      )}
      <Toaster />
    </div>
  );
};

export default JsonViewer;
