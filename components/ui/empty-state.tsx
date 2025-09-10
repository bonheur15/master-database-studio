import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="h-full flex flex-col items-center justify-center text-center p-6 w-[100%] b">
      <CardHeader className="w-[100%]">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        )}
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground mt-2 w-[100%] ">
          {description}
        </CardDescription>
      </CardHeader>
      {action && <CardContent className="pt-4">{action}</CardContent>}
    </Card>
  );
}
