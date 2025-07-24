"use client";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css"; // Using a pre-built dark theme
import { format } from "sql-formatter";

import {
  History,
  Play,
  Share,
  Sparkles,
  X,
  FileDown,
  PlusCircle,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Initial tab setup
const initialTabs = [
  { id: "tab1", name: "Query 1", query: "SELECT * FROM users;" },
  {
    id: "tab2",
    name: "Query 2",
    query: "SELECT * FROM products\nWHERE category = 'electronics';",
  },
];

export function QueryEditor() {
  const [tabs, setTabs] = React.useState(initialTabs);
  const [activeTabId, setActiveTabId] = React.useState("tab1");
  const [history, setHistory] = React.useState<string[]>([]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleQueryChange = (newQuery: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, query: newQuery } : tab
      )
    );
  };

  const handleRunQuery = () => {
    if (activeTab && !history.includes(activeTab.query)) {
      setHistory([activeTab.query, ...history]);
    }
    // In a real app, you would execute the query here
    alert(`Running query from ${activeTab?.name}:\n${activeTab?.query}`);
  };

  const handleFormatQuery = () => {
    if (activeTab) {
      try {
        const formatted = format(activeTab.query, { language: "sql" });
        handleQueryChange(formatted);
      } catch (error) {
        console.error("Failed to format SQL:", error);
      }
    }
  };

  const addTab = () => {
    const newTabId = `tab${Date.now()}`;
    const newTab = {
      id: newTabId,
      name: `Query ${tabs.length + 1}`,
      query: "-- New Query",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    setTabs(tabs.filter((tab) => tab.id !== tabId));

    // Set new active tab
    if (activeTabId === tabId) {
      const newActiveTab = tabs[tabIndex - 1] || tabs[tabIndex + 1];
      setActiveTabId(newActiveTab.id);
    }
  };

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Master Console</CardTitle>
            <CardDescription>
              Run SQL or MongoDB queries with tabbed editing. [cite: 40, 41, 49]
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFormatQuery}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format Query</p>
              </TooltipContent>
            </Tooltip>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Query History</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 py-4">
                  {history.length > 0 ? (
                    history.map((q, i) => (
                      <div
                        key={i}
                        className="text-sm p-2 border rounded-md bg-muted/50 font-mono"
                      >
                        {q}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No queries run yet.
                    </p>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="gap-x-2" onClick={handleRunQuery}>
              <Play className="h-4 w-4" /> Run Query
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs
            value={activeTabId}
            onValueChange={setActiveTabId}
            className="flex-1 flex flex-col"
          >
            <div className="px-4">
              <TabsList className="h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-auto p-0"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <span>{tab.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="p-0.5 rounded hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </TabsTrigger>
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={addTab}
                      className="ml-2 p-1.5 rounded-md hover:bg-muted"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Query Tab</p>
                  </TooltipContent>
                </Tooltip>
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="flex-1 mt-0">
                <Editor
                  value={tab.query}
                  onValueChange={handleQueryChange}
                  highlight={(code) => highlight(code, languages.sql, "sql")}
                  padding={16}
                  className="font-mono text-sm bg-[#282a36] text-white rounded-b-lg h-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  style={{
                    minHeight: "100%",
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground border-t pt-4">
          Status: Ready | Results will be shown in a new panel below.
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
