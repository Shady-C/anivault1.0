"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import type { AnimeWatchSource } from "@/types/anime";

interface WatchSourcesSectionProps {
  sources: AnimeWatchSource[];
  onAdd?: (url: string) => Promise<void>;
}

export function WatchSourcesSection({ sources, onAdd }: WatchSourcesSectionProps) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!url.trim() || !onAdd) return;
    setAdding(true);
    try {
      await onAdd(url.trim());
      setUrl("");
      setShowInput(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/8 border border-white/10 text-sm text-[var(--text)] hover:bg-white/12 transition-colors press-feedback"
          >
            {source.source_name || "Link"}
            <ExternalLink size={12} className="text-[var(--text-muted)]" />
          </a>
        ))}

        {!showInput && (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-dashed border-white/20 text-sm text-[var(--text-muted)] hover:border-white/40 press-feedback"
          >
            <Plus size={14} />
            Add Source
          </button>
        )}
      </div>

      {showInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste streaming URL..."
            className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40"
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowInput(false); }}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={adding || !url.trim()}
            className="px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50"
          >
            {adding ? "..." : "Add"}
          </button>
          <button
            onClick={() => { setShowInput(false); setUrl(""); }}
            className="px-3 py-2 rounded-xl bg-white/5 text-[var(--text-muted)] text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {sources.length === 0 && !showInput && (
        <p className="text-xs text-[var(--text-muted)]">
          No streaming sources added yet. Be the first to add one.
        </p>
      )}
    </div>
  );
}
