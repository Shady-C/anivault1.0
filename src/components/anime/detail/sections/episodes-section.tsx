"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";

interface Episode {
  mal_id: number;
  title?: string | null;
  aired?: string | null;
  filler?: boolean;
  recap?: boolean;
}

interface EpisodesSectionProps {
  episodes?: Episode[] | null;
}

export function EpisodesSection({ episodes }: EpisodesSectionProps) {
  const [visible, setVisible] = useState(12);

  if (!episodes || episodes.length === 0) {
    return <EmptyState message="No episodes information available." />;
  }

  const displayed = episodes.slice(0, visible);
  const hasMore = visible < episodes.length;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {displayed.map((ep) => (
          <div
            key={ep.mal_id}
            className={`rounded-xl p-2.5 border text-center ${ep.filler ? "border-yellow-500/20 bg-yellow-500/5" : "border-white/6 bg-white/4"}`}
          >
            <div className="text-xs font-bold text-[var(--text)]">Ep {ep.mal_id}</div>
            {ep.title && (
              <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{ep.title}</div>
            )}
            {ep.filler && <span className="text-[9px] text-yellow-500">Filler</span>}
          </div>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => setVisible(v => v + 12)}
        >
          <ChevronDown size={14} className="mr-1" />
          Show More ({episodes.length - visible} left)
        </Button>
      )}
    </>
  );
}
