"use client";

import type { ParsedEntry, JikanResult, SearchResultEntry } from "@/lib/pipeline/types";
import { Button } from "@/components/ui/button";

function confidenceBadge(confidence: string) {
  if (confidence === "high") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (confidence === "medium") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (confidence === "low") return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-white/5 text-[var(--text-muted)] border-white/10";
}

function cardBorder(confidence: string) {
  if (confidence === "low") return "border-l-4 border-l-red-500";
  if (confidence === "none") return "border-l-4 border-l-amber-500";
  return "";
}

interface ImportAnimeCardProps {
  entry: ParsedEntry;
  result: SearchResultEntry | undefined;
  onAccept: () => void;
  onReject: () => void;
  onSearch: () => void;
  onPickOther: (match: JikanResult) => void;
  onRetry: () => void;
}

export default function ImportAnimeCard({
  entry,
  result,
  onAccept,
  onReject,
  onSearch,
  onPickOther,
  onRetry,
}: ImportAnimeCardProps) {
  const status = result?.status || "searching";
  const top = result?.topMatch;
  const options = result?.results?.slice(1) || [];

  if (status === "approved") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-3">
        <p className="text-sm text-green-400">
          Approved: <strong>{entry.title}</strong> &rarr;{" "}
          {result?.approvedMatch?.title} (#{result?.approvedMatch?.malId})
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3">
        <p className="text-sm text-red-400">
          Rejected: <strong>{entry.title}</strong>
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 ${cardBorder(result?.confidence || "")}`}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
        {/* Entry info */}
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">
            {entry.title}
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {entry.status || "No status"}
          </p>
          {entry.notes && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {entry.notes}
            </p>
          )}
        </div>

        {/* Match result */}
        <div>
          {status === "searching" && (
            <p className="text-sm text-[var(--text-muted)]">Searching...</p>
          )}
          {status === "failed" && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-red-400">Search failed.</p>
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}
          {status === "no-results" && (
            <p className="text-sm text-amber-400">No results found.</p>
          )}

          {top && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg)] p-3">
              <div className="mb-2 flex gap-3">
                {top.coverImage ? (
                  <img
                    src={top.coverImage}
                    alt=""
                    className="h-28 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-28 w-20 rounded-lg bg-white/5" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">
                    {top.title}
                  </p>
                  {top.titleEnglish && (
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {top.titleEnglish}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {top.year ?? "?"} &bull; {top.type ?? "?"} &bull; Ep{" "}
                    {top.episodes ?? "?"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Score {top.score ?? "?"} &bull;{" "}
                    {top.airingStatus || "Unknown"}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-lg border px-2 py-0.5 text-xs ${confidenceBadge(result?.confidence || "")}`}
                  >
                    {result?.confidence}
                  </span>
                </div>
              </div>
              {top.synopsis && (
                <p className="text-xs text-[var(--text-muted)]">
                  {top.synopsis.slice(0, 150)}...
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={onAccept}
              disabled={!top}
              className="bg-green-600 hover:bg-green-500"
            >
              Accept
            </Button>
            <Button variant="destructive" size="sm" onClick={onReject}>
              Reject
            </Button>
            <Button variant="outline" size="sm" onClick={onSearch}>
              Search
            </Button>
            {options.length > 0 && (
              <select
                defaultValue=""
                onChange={(e) => {
                  const selected = options.find(
                    (o) => String(o.malId) === e.target.value
                  );
                  if (selected) onPickOther(selected);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-[var(--text)]"
              >
                <option value="">Pick other</option>
                {options.map((option) => (
                  <option key={option.malId} value={option.malId}>
                    {option.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
