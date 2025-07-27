"use client";

import {
  Beaker,
  Database,
  Link,
  Plug,
  PlusCircle,
  Save,
  RefreshCw,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { match } from "ts-pattern";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Connection } from "@/types/connection";
import { addConnection } from "@/lib/connection-storage";
import { testConnection } from "@/app/actions/connection";
import { Toaster } from "@/components/ui/sonner";

export function ConnectForm() {
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "auto">("manual");

  const [connectionName, setConnectionName] = useState("");
  const [dbType, setDbType] = useState<Connection["type"]>("mysql");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("3306");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [connectionString, setConnectionString] = useState("");
  const [saveToVault, setSaveToVault] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    const defaultPort = match(dbType)
      .with("mysql", () => "3306")
      .with("postgresql", () => "5432")
      .with("mongodb", () => "27017")
      .otherwise(() => "");
    setPort(defaultPort);
  }, [dbType]);

  const connectionStringExample = match(dbType)
    .with("mysql", () => "mysql://user:pass@host:3306/db")
    .with("postgresql", () => "postgresql://user:pass@host:5432/db")
    .with("mongodb", () => "mongodb+srv://user:pass@cluster.mongodb.net/db")
    .otherwise(() => "protocol://user:pass@host/db");

  const resetForm = () => {
    setConnectionName("");
    setDbType("mysql");
    setHost("localhost");
    setPort("3306");
    setUser("");
    setPassword("");
    setDatabase("");
    setConnectionString("");
    setSaveToVault(true);
    setTab("manual");
  };

  const parseConnectionString = (str: string) => {
    try {
      const url = new URL(str);
      const protocol = url.protocol.replace(":", "");
      const [username, pass] = url.username
        ? [url.username, url.password]
        : ["", ""];
      const db = url.pathname.replace("/", "");

      const type = match(protocol)
        .with("mysql", () => "mysql")
        .with("postgres", () => "postgresql")
        .with("postgresql", () => "postgresql")
        .with("mongodb+srv", () => "mongodb")
        .with("mongodb", () => "mongodb")
        .otherwise(() => {
          throw new Error("Unsupported protocol");
        });

      return {
        type,
        user: username,
        password: pass,
        host: url.hostname,
        port:
          url.port ||
          match(type)
            .with("mysql", () => "3306")
            .with("postgresql", () => "5432")
            .with("mongodb", () => "27017")
            .otherwise(() => ""),
        database: db,
      };
    } catch (e) {
      throw new Error("Invalid connection string");
    }
  };

  const handleConnectionStringChange = (str: string) => {
    setConnectionString(str);

    try {
      const parsed = parseConnectionString(str);
      setDbType(parsed.type as Connection["type"]);
      setUser(parsed.user);
      setPassword(parsed.password);
      setHost(parsed.host);
      setPort(parsed.port);
      setDatabase(parsed.database);
      toast.success("Connection string parsed successfully!");
    } catch (e) {
      toast.error("Invalid connection string format.");
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const connectionDetails = {
        name: connectionName,
        type: dbType,
        host,
        port: parseInt(port),
        user,
        password,
        database,
      };
      const result = await testConnection(connectionDetails);
      if (result.success) {
        toast.success("Connection Successful", {
          description: result.message,
        });
      } else {
        toast.error("Test Failed", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    try {
      const newConnection: Omit<Connection, "id" | "filepath"> = {
        name: connectionName,
        type: dbType,
        host,
        port: parseInt(port),
        user,
        password,
        database,
      };

      if (saveToVault) {
        const updatedConnections = await addConnection(newConnection);
        const added = updatedConnections.find(
          (conn) =>
            conn.name === newConnection.name && conn.host === newConnection.host
        );
        if (added) {
          toast.success("Saved", {
            description: `Connected and saved "${connectionName}"`,
          });
          router.push(`/studio?connectionId=${added.id}`);
        }
      } else {
        toast.success("Connected", {
          description: `Connected to "${connectionName}"`,
        });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Connection Failed", {
        description: "Failed to connect or save.",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Connection
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <Toaster />
        <DialogHeader>
          <DialogTitle>New Database Connection</DialogTitle>
          <DialogDescription>
            Connect via manual setup or a connection string.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-[100%]">
            <TabsTrigger value="manual">
              <Database className="mr-2 h-4 w-4" /> Manual
            </TabsTrigger>
            <TabsTrigger value="auto">
              <Link className="mr-2 h-4 w-4" /> Connection String
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="pt-4">
            <div className="grid gap-4">
              <InputField
                label="Connection Name"
                value={connectionName}
                onChange={setConnectionName}
              />
              <div className="space-y-2">
                <Label>Database Type</Label>
                <Select
                  value={dbType}
                  onValueChange={(v) => setDbType(v as Connection["type"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Host" value={host} onChange={setHost} />
                <InputField label="Port" value={port} onChange={setPort} />
              </div>
              <InputField label="User" value={user} onChange={setUser} />
              <InputField
                label="Password"
                value={password}
                type="password"
                onChange={setPassword}
              />
              <InputField
                label="Database Name"
                value={database}
                onChange={setDatabase}
              />
            </div>
          </TabsContent>

          <TabsContent value="auto" className="pt-4">
            <div className="space-y-4">
              <InputField
                label="Connection Name"
                value={connectionName}
                onChange={setConnectionName}
              />
              <InputField
                label="Connection String"
                value={connectionString}
                onChange={handleConnectionStringChange}
                placeholder={connectionStringExample}
              />
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <CardDescription className="text-xs">
                    Example:{" "}
                    <code className="font-mono">{connectionStringExample}</code>
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="save-connection"
              checked={saveToVault}
              onCheckedChange={setSaveToVault}
            />
            <Label
              htmlFor="save-connection"
              className="text-muted-foreground text-sm flex gap-2"
            >
              <Save className="h-4 w-4" />
              Save to vault
            </Label>
          </div>
          <div className="flex gap-2 self-end">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="gap-2"
            >
              {testingConnection ? (
                <span className="animate-spin">
                  <RefreshCw className="h-4 w-4" />
                </span>
              ) : (
                <Beaker className="h-4 w-4" />
              )}
              Test
            </Button>
            <Button className="gap-2" onClick={handleConnect}>
              <Plug className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
