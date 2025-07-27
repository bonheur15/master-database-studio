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

// Helper component to render database icons
const DatabaseIcon = ({ dbType }: { dbType: string }) => (
  // In a real app, you might use more specific icons
  <Database className="h-4 w-4 text-muted-foreground" />
);

export function ConnectForm() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
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

  // Update port automatically when DB type changes
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
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const connectionDetails = {
        name: connectionName,
        type: dbType,
        host: host,
        port: parseInt(port),
        user: user,
        password: password,
        database: database,
      };
      const result = await testConnection(connectionDetails);
      if (result.success) {
        toast.success("Connection Test", {
          description: result.message,
        });
      } else {
        toast.error("Connection Test Failed", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Connection Test Failed", {
        description: "An unexpected error occurred during connection test.",
      });
      console.error("Connection test error:", error);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    try {
      const newConnection: Omit<Connection, "id" | "filepath"> = {
        name: connectionName,
        type: dbType,
        host: host,
        port: parseInt(port),
        user: user,
        password: password,
        database: database,
      };

      if (saveToVault) {
        const updatedConnections = await addConnection(newConnection);
        const addedConnection = updatedConnections.find(
          (conn) =>
            conn.name === newConnection.name && conn.host === newConnection.host
        );
        if (addedConnection) {
          toast.success("Connection Saved", {
            description: `Connection "${connectionName}" saved to vault.`,
          });
          router.push(`/studio?connectionId=${addedConnection.id}`);
        } else {
          toast.error("Connection Save Failed", {
            description: "Could not retrieve the saved connection's ID.",
          });
        }
      } else {
        toast.info("Connected", {
          description: `Connecting to "${connectionName}"...`,
        });
        // For unsaved connections, we don't have a UUID to pass in the query.
        // You might want to handle this case differently, e.g., by passing connection details directly
        // or by not redirecting.
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Connection Error", {
        description: "Failed to save or connect to the database.",
      });
      console.error("Connection error:", error);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {/* The document specifies this form is for adding connections [cite: 77, 147] */}
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
              Connect to a database manually or with a connection string.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <Database className="mr-2 h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="auto">
                <Link className="mr-2 h-4 w-4" />
                Connection String
              </TabsTrigger>
            </TabsList>

            {/* Manual Connection Form */}
            <TabsContent value="manual" className="pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="connectionName">Connection Name</Label>
                  <Input
                    id="connectionName"
                    placeholder="My New Database"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbType">Database Type</Label>
                  <Select
                    value={dbType}
                    onValueChange={(value) =>
                      setDbType(value as Connection["type"])
                    }
                  >
                    <SelectTrigger id="dbType">
                      <SelectValue placeholder="Select a database type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      placeholder="localhost"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      placeholder="3306"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Input
                    id="user"
                    placeholder="root"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    placeholder="mydatabase"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Auto (Connection String) Form */}
            <TabsContent value="auto" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connectionString">Connection String</Label>
                  <Input
                    id="connectionString"
                    placeholder={connectionStringExample}
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                  />
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <CardDescription className="text-xs">
                      Example:{" "}
                      <code className="font-mono">
                        {connectionStringExample}
                      </code>
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="save-connection"
                checked={saveToVault}
                onCheckedChange={setSaveToVault}
              />
              {/* The app supports saving connections to a local vault [cite: 15, 79] */}
              <Label
                htmlFor="save-connection"
                className="flex items-center gap-2 text-sm font-normal text-muted-foreground"
              >
                <Save className="h-4 w-4" />
                Save to connection vault
              </Label>
            </div>
            <div className="flex gap-2 self-end">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleTestConnection}
                disabled={testingConnection}
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
              <Button type="submit" className="gap-2" onClick={handleConnect}>
                <Plug className="h-4 w-4" />
                Connect
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
