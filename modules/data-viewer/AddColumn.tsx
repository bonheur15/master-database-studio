"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ColumnOptions = {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  arrayDimension?: number;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  default?: string;
  check?: string;
  comment?: string;
};

const POSTGRES_TYPES = [
  "SMALLINT",
  "INT",
  "BIGINT",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "DOUBLE PRECISION",
  "SERIAL",
  "BIGSERIAL",
  "MONEY",
  "CHAR",
  "VARCHAR",
  "TEXT",
  "BYTEA",
  "BOOLEAN",
  "DATE",
  "TIME",
  "TIMESTAMP",
  "TIMESTAMPTZ",
  "INTERVAL",
  "UUID",
  "JSON",
  "JSONB",
  "XML",
  "INET",
  "CIDR",
  "MACADDR",
  "POINT",
  "LINE",
  "LSEG",
  "BOX",
  "PATH",
  "POLYGON",
  "CIRCLE",
];

export default function AddColumnDialogs({
  tableName,
  onSubmit,
}: {
  tableName: string;
  onSubmit: (sql: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnOptions[]>([
    {
      name: "",
      type: "TEXT",
      isNullable: true,
      isPrimaryKey: false,
      isUnique: false,
      default: "",
      check: "",
      comment: "",
    },
  ]);
  const [step, setStep] = useState<"form" | "review">("form");
  const [sqlPreview, setSqlPreview] = useState("");

  const handleChange = <K extends keyof ColumnOptions>(
    index: number,
    key: K,
    value: ColumnOptions[K]
  ) => {
    setColumns((prev) => {
      const newCols = [...prev];
      newCols[index] = { ...newCols[index], [key]: value };
      return newCols;
    });
  };

  const addColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        name: "",
        type: "TEXT",
        isNullable: true,
        isPrimaryKey: false,
        isUnique: false,
        default: "",
        check: "",
        comment: "",
      },
    ]);
  };

  const removeColumn = (index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const buildSQLFragment = (col: ColumnOptions) => {
    let typeStr = col.type;
    if (["VARCHAR", "CHAR"].includes(col.type) && col.length)
      typeStr += `(${col.length})`;
    if (["NUMERIC", "DECIMAL"].includes(col.type)) {
      if (col.precision)
        typeStr += `(${col.precision}${col.scale ? `, ${col.scale}` : ""})`;
    }
    if (col.arrayDimension) typeStr += "[]".repeat(col.arrayDimension);
    const constraints: string[] = [];
    if (col.isPrimaryKey) constraints.push("PRIMARY KEY");
    if (col.isUnique) constraints.push("UNIQUE");
    if (col.isNullable === false) constraints.push("NOT NULL");
    if (col.default) constraints.push(`DEFAULT ${col.default}`);
    if (col.check) constraints.push(`CHECK (${col.check})`);
    return `"${col.name}" ${typeStr} ${constraints.join(" ")}`.trim();
  };

  const handleReview = () => {
    if (columns.some((c) => !c.name || !c.type))
      return alert("All columns must have a name and type");
    const sql = columns
      .map((c) => `ALTER TABLE ${tableName} ADD COLUMN ${buildSQLFragment(c)};`)
      .join("\n");
    setSqlPreview(sql);
    setStep("review");
  };

  const handleSubmit = () => {
    if (!sqlPreview) return alert("No SQL to submit");
    onSubmit(sqlPreview);
    setStep("form");
    setOpen(false);
    setColumns([
      {
        name: "",
        type: "TEXT",
        isNullable: true,
        isPrimaryKey: false,
        isUnique: false,
        default: "",
        check: "",
        comment: "",
      },
    ]);
    setSqlPreview("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Columns</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl w-full max-h-[calc(100vh-10rem)] overflow-scroll space-y-4">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Add Columns to {tableName}</DialogTitle>
              <DialogDescription>
                Fill in each column, then review SQL
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {columns.map((col, idx) => {
                const showLength = ["VARCHAR", "CHAR"].includes(col.type);
                const showPrecision = ["NUMERIC", "DECIMAL"].includes(col.type);
                const showArray = [
                  "INT",
                  "BIGINT",
                  "SMALLINT",
                  "DECIMAL",
                  "NUMERIC",
                  "REAL",
                  "DOUBLE PRECISION",
                  "TEXT",
                  "CHAR",
                  "VARCHAR",
                ].includes(col.type);

                return (
                  <div key={idx} className="border p-4 rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Column #{idx + 1}</Label>
                      {columns.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeColumn(idx)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <Input
                        placeholder="Name"
                        value={col.name}
                        onChange={(e) =>
                          handleChange(idx, "name", e.target.value)
                        }
                      />
                      <Select
                        value={col.type}
                        onValueChange={(value) =>
                          handleChange(idx, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {POSTGRES_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {showLength && (
                        <Input
                          type="number"
                          placeholder="Length"
                          value={col.length || ""}
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "length",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      )}
                      {showPrecision && (
                        <>
                          <Input
                            type="number"
                            placeholder="Precision"
                            value={col.precision || ""}
                            onChange={(e) =>
                              handleChange(
                                idx,
                                "precision",
                                parseInt(e.target.value)
                              )
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Scale"
                            value={col.scale || ""}
                            onChange={(e) =>
                              handleChange(
                                idx,
                                "scale",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </>
                      )}
                      {showArray && (
                        <Input
                          type="number"
                          placeholder="Array dim"
                          value={col.arrayDimension || ""}
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "arrayDimension",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      )}
                    </div>

                    <div className="flex gap-4 items-center flex-wrap">
                      <Checkbox
                        checked={col.isNullable}
                        onCheckedChange={(value) =>
                          handleChange(idx, "isNullable", value)
                        }
                      />
                      <Label>Nullable</Label>
                      <Checkbox
                        checked={col.isPrimaryKey}
                        onCheckedChange={(value) =>
                          handleChange(idx, "isPrimaryKey", value)
                        }
                      />
                      <Label>Primary Key</Label>
                      <Checkbox
                        checked={col.isUnique}
                        onCheckedChange={(value) =>
                          handleChange(idx, "isUnique", value)
                        }
                      />
                      <Label>Unique</Label>
                    </div>

                    <Input
                      placeholder="Default / expression"
                      value={col.default}
                      onChange={(e) =>
                        handleChange(idx, "default", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Check (optional)"
                      value={col.check}
                      onChange={(e) =>
                        handleChange(idx, "check", e.target.value)
                      }
                    />
                    <Textarea
                      placeholder="Comment (optional)"
                      value={col.comment}
                      onChange={(e) =>
                        handleChange(idx, "comment", e.target.value)
                      }
                    />
                  </div>
                );
              })}
              <Button variant="outline" onClick={addColumn}>
                Add Another Column
              </Button>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReview}>Review SQL</Button>
            </DialogFooter>
          </>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <Label>SQL Preview</Label>
            <pre className="p-3 rounded-md border bg-muted text-sm overflow-x-auto">
              {columns
                .map(
                  (c) =>
                    `ALTER TABLE ${tableName} ADD COLUMN ${buildSQLFragment(
                      c
                    )};`
                )
                .join("\n")}
            </pre>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
