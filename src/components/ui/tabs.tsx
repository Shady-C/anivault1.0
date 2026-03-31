"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils/cn";

export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full p-1 gap-1",
        "bg-white/5 border border-white/8",
        className
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
        "text-[var(--text-muted)]",
        "data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

function TabsContent({ className, ...props }: TabsContentProps) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
