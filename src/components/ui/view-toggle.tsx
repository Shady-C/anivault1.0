"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ViewToggleProps {
  view: "grid" | "list";
  onToggle: (view: "grid" | "list") => void;
  className?: string;
}

export function ViewToggle({ view, onToggle, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-0.5 bg-white/5 p-1 rounded-lg border border-white/8", className)}>
      <button
        onClick={() => onToggle("grid")}
        className={`p-1.5 rounded-md transition-colors ${
          view === "grid"
            ? "bg-white/10 text-[var(--text)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onToggle("list")}
        className={`p-1.5 rounded-md transition-colors ${
          view === "list"
            ? "bg-white/10 text-[var(--text)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
        aria-label="List view"
        title="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}
