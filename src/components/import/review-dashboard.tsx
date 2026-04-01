"use client";

import { Button } from "@/components/ui/button";
import ImportAnimeCard from "./anime-card";
import ImportProgressBar from "./progress-bar";
import type { ParsedEntry, JikanResult, SearchResultEntry } from "@/lib/pipeline/types";

const FILTERS = ["all", "pending", "high", "low-none", "approved", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

interface ReviewDashboardProps {
  entries: ParsedEntry[];
  searchResults: Record<number, SearchResultEntry>;
  searchProgress: {
    total: number;
    completed: number;
    isRunning: boolean;
    currentTitle: string;
  };
  filter: Filter;
  setFilter: (f: Filter) => void;
  onAutoApproveHigh: () => void;
  onSearchAll: () => void;
  onAccept: (index: number, match: JikanResult | null) => void;
  onReject: (index: number) => void;
  onSearch: (entry: ParsedEntry, index: number) => void;
  onPickOther: (index: number, match: JikanResult) => void;
  onRetry: (entry: ParsedEntry, index: number) => void;
  onExport: () => void;
}

export default function ReviewDashboard({
  entries,
  searchResults,
  searchProgress,
  filter,
  setFilter,
  onAutoApproveHigh,
  onSearchAll,
  onAccept,
  onReject,
  onSearch,
  onPickOther,
  onRetry,
  onExport,
}: ReviewDashboardProps) {
  // Only show entries that need resolution (no mal_id from parse)
  const unresolvedEntries = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.mal_id === null);

  const filtered = unresolvedEntries.filter(({ index }) => {
    const result = searchResults[index];
    if (filter === "all") return true;
    if (filter === "pending") return result?.status === "pending";
    if (filter === "high")
      return result?.confidence === "high" && result?.status === "pending";
    if (filter === "low-none") {
      return (
        (result?.confidence === "low" || result?.confidence === "none") &&
        result?.status !== "approved" &&
        result?.status !== "rejected"
      );
    }
    if (filter === "approved") return result?.status === "approved";
    if (filter === "rejected") return result?.status === "rejected";
    return true;
  });

  const values = Object.values(searchResults);
  const approved = values.filter((r) => r.status === "approved").length;
  const rejected = values.filter((r) => r.status === "rejected").length;
  const pending = values.filter((r) => r.status === "pending").length;
  const resolved = approved + rejected;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4">
      {/* Stats */}
      <div className="mb-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--text)]">
          {resolved} of {unresolvedEntries.length} resolved &bull;{" "}
          <span className="text-green-400">Approved {approved}</span> &bull;{" "}
          <span className="text-red-400">Rejected {rejected}</span> &bull;{" "}
          <span className="text-[var(--text-muted)]">Pending {pending}</span>
        </p>
      </div>

      {searchProgress.isRunning && (
        <ImportProgressBar progress={searchProgress} />
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              filter === value
                ? "bg-[var(--accent)] text-white"
                : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onAutoApproveHigh} className="bg-green-600 hover:bg-green-500">
          Auto-approve high
        </Button>
        <Button variant="secondary" size="sm" onClick={onSearchAll}>
          Search all
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          Continue to import
        </Button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(({ entry, index }) => (
          <ImportAnimeCard
            key={index}
            entry={entry}
            result={searchResults[index]}
            onAccept={() => onAccept(index, searchResults[index]?.topMatch)}
            onReject={() => onReject(index)}
            onSearch={() => onSearch(entry, index)}
            onPickOther={(match) => onPickOther(index, match)}
            onRetry={() => onRetry(entry, index)}
          />
        ))}
      </div>
    </div>
  );
}
