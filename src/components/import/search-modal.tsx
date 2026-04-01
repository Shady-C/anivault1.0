"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { JikanResult } from "@/lib/pipeline/types";

interface SearchModalProps {
  initialQuery: string;
  onClose: () => void;
  onPick: (item: JikanResult) => void;
}

function mapResult(data: Record<string, unknown>): JikanResult {
  const images = data.images as Record<string, Record<string, string>> | undefined;
  return {
    malId: data.mal_id as number,
    title: (data.title as string) || "",
    titleEnglish: (data.title_english as string | null) ?? null,
    year: (data.year as number | null) ?? null,
    score: (data.score as number | null) ?? null,
    episodes: (data.episodes as number | null) ?? null,
    synopsis: data.synopsis
      ? (data.synopsis as string).slice(0, 200)
      : null,
    coverImage:
      images?.jpg?.large_image_url || images?.jpg?.image_url || null,
    airingStatus: (data.status as string) || "",
    type: (data.type as string) || "",
  };
}

export default function SearchModal({
  initialQuery,
  onClose,
  onPick,
}: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<JikanResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/import/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      const mapped = ((data.data || []) as Record<string, unknown>[]).map(
        mapResult
      );
      setResults(mapped);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h3 className="mb-3 font-[var(--font-heading)] text-lg font-semibold text-[var(--text)]">
          Manual Search
        </h3>
        <div className="mb-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <Button size="sm" onClick={runSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.malId}
              type="button"
              onClick={() => onPick(item)}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--bg)] p-2 text-left transition hover:border-[var(--accent)]"
            >
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt=""
                  className="h-16 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-12 rounded-lg bg-white/5" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {item.year ?? "?"} &bull; {item.type ?? "?"} &bull; Score{" "}
                  {item.score ?? "?"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
