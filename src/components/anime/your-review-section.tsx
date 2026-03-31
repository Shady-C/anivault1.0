"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { RATING_MAP, STATUS_MAP, VIBE_TAGS, type AnimeStatus } from "@/types/anime";
import { cn } from "@/lib/utils/cn";

interface YourReviewSectionProps {
  animeId: string;
  initialStatus?: AnimeStatus | null;
  initialRating?: 1 | 2 | 3 | 4 | 5 | null;
  initialVibes?: string[] | null;
  initialHotTake?: string | null;
  hasVaultMates?: boolean;
  onUpdate: (data: {
    status?: AnimeStatus | null;
    rating?: 1 | 2 | 3 | 4 | 5 | null;
    vibes?: string[] | null;
    hot_take?: string | null;
  }) => Promise<void>;
  onRecommend?: () => void;
}

export function YourReviewSection({
  initialStatus,
  initialRating,
  initialVibes,
  initialHotTake,
  hasVaultMates = false,
  onUpdate,
  onRecommend,
}: YourReviewSectionProps) {
  const [status, setStatus] = useState<AnimeStatus | null>(initialStatus ?? null);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(initialRating ?? null);
  const [vibes, setVibes] = useState<string[]>(initialVibes ?? []);
  const [hotTake, setHotTake] = useState(initialHotTake ?? "");
  const [isPending, startTransition] = useTransition();

  const save = (updates: Partial<{ status: AnimeStatus | null; rating: 1|2|3|4|5|null; vibes: string[]; hot_take: string }>) => {
    startTransition(() => {
      onUpdate(updates);
    });
  };

  const handleStatus = (s: AnimeStatus) => {
    const next = status === s ? null : s;
    setStatus(next);
    save({ status: next });
  };

  const handleRating = (r: 1|2|3|4|5) => {
    const next = rating === r ? null : r;
    setRating(next);
    save({ rating: next });
  };

  const handleVibe = (vibe: string) => {
    const next = vibes.includes(vibe)
      ? vibes.filter(v => v !== vibe)
      : vibes.length >= 5 ? vibes : [...vibes, vibe];
    setVibes(next);
    save({ vibes: next });
  };

  const statusEntries = Object.entries(STATUS_MAP) as [AnimeStatus, { label: string; icon: string; color: string }][];

  return (
    <div className="space-y-5">
      {/* Status buttons (2x2 grid) */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Status</p>
        <div className="grid grid-cols-2 gap-2">
          {statusEntries.map(([key, { label, icon, color }]) => (
            <button
              key={key}
              onClick={() => handleStatus(key)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all press-feedback text-sm font-semibold",
                status === key
                  ? "text-white border-transparent"
                  : "bg-white/5 border-white/8 text-[var(--text-muted)]"
              )}
              style={status === key ? { background: color, borderColor: "transparent" } : {}}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating picker */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Rating</p>
        <div className="flex justify-between gap-1">
          {(Object.entries(RATING_MAP) as [string, { emoji: string; label: string }][]).map(([r, { emoji, label }]) => {
            const rNum = Number(r) as 1|2|3|4|5;
            const isActive = rating === rNum;
            return (
              <button
                key={r}
                onClick={() => handleRating(rNum)}
                className={cn(
                  "flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border transition-all press-feedback",
                  isActive ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-white/8 bg-white/4"
                )}
              >
                <span className={cn("transition-all", isActive ? "text-3xl" : "text-2xl")}>{emoji}</span>
                <span className="text-[9px] text-[var(--text-muted)] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vibe tags */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Vibes <span className="text-[var(--text-dim)] normal-case font-normal">(max 5)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {VIBE_TAGS.map((vibe) => {
            const active = vibes.includes(vibe);
            return (
              <button
                key={vibe}
                onClick={() => handleVibe(vibe)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold transition-all press-feedback border",
                  active
                    ? "bg-[var(--purple)] border-[var(--purple)] text-white"
                    : "bg-white/5 border-white/10 text-[var(--text-muted)]"
                )}
              >
                {vibe}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hot Take */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Hot Take</p>
        <div className="relative">
          <textarea
            value={hotTake}
            onChange={(e) => setHotTake(e.target.value)}
            onBlur={() => save({ hot_take: hotTake })}
            placeholder="What's your hot take?"
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)]/40 resize-none"
          />
          <span className={cn(
            "absolute bottom-2 right-3 text-[10px]",
            hotTake.length > 140 ? "text-[var(--red)]" : "text-[var(--text-dim)]"
          )}>
            {hotTake.length}/140
          </span>
        </div>
      </div>

      {/* Send recommendation */}
      {hasVaultMates && onRecommend && (
        <button
          onClick={onRecommend}
          className="flex items-center gap-2 text-sm text-[var(--purple)] font-medium press-feedback"
        >
          <Send size={14} />
          Recommend to crew
        </button>
      )}

      {isPending && (
        <p className="text-[10px] text-[var(--text-dim)] text-right">Saving...</p>
      )}
    </div>
  );
}
