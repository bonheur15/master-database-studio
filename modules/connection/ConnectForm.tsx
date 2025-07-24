"use client"

import {
  Beaker,
  Database,
  Link,
  Plug,
  PlusCircle,
  Save,
} from "lucide-react"
import * as React from "react"
import { match } from "ts-pattern"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper component to render database icons
const DatabaseIcon = ({ dbType }: { dbType: string }) => (
  // In a real app, you might use more specific icons
  <Database className="h-4 w-4 text-muted-foreground" />
)

export function ConnectForm() {
  const [dbType, setDbType] = React.useState("mysql")
  const [port, setPort] = React.useState("3306")

  // Update port automatically when DB type changes
  React.useEffect(() => {
    const defaultPort = match(dbType)
      .with("mysql", () => "3306")
      .with("postgresql", () => "5432")
      .with("mongodb", () => "27017")
      .otherwise(() => "")
    setPort(defaultPort)
  }, [dbType])

  const connectionStringExample = match(dbType)
    .with("mysql", () => "mysql://user:pass@host:3306/db")
    .with("postgresql", () => "postgresql://user:pass@host:5432/db")
    .with("mongodb", () => "mongodb+srv://user:pass@cluster.mongodb.net/db")
    .otherwise(() => "protocol://user:pass@host/db")

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* The document specifies this form is for adding connections [cite: 77, 147] */}
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
                <Label htmlFor="dbType">Database Type</Label>
                <Select value={dbType} onValueChange={setDbType}>
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
                  <Input id="host" placeholder="localhost" defaultValue="localhost" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" placeholder="3306" value={port} onChange={(e) => setPort(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Input id="user" placeholder="root" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="database">Database Name (Optional)</Label>
                <Input id="database" placeholder="mydatabase" />
              </div>
            </div>
          </TabsContent>

          {/* Auto (Connection String) Form */}
          <TabsContent value="auto" className="pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connectionString">Connection String</Label>
                <Input id="connectionString" placeholder={connectionStringExample} />
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <CardDescription className="text-xs">
                    Example: <code className="font-mono">{connectionStringExample}</code>
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Switch id="save-connection" />
            {/* The app supports saving connections to a local vault [cite: 15, 79] */}
            <Label htmlFor="save-connection" className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Save className="h-4 w-4" />
              Save to connection vault
            </Label>
          </div>
          <div className="flex gap-2 self-end">
            <Button variant="outline" className="gap-2">
              <Beaker className="h-4 w-4" />
              Test
            </Button>
            <Button type="submit" className="gap-2">
              <Plug className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}