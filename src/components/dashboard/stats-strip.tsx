"use client";

import { Eye, Play, BookMarked, Zap, Bell } from "lucide-react";

interface StatChip {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface StatsStripProps {
  watchedCount: number;
  watchingCount: number;
  queuedCount: number;
  peakCount: number;
  newInVaultsCount: number;
}

export function StatsStrip({
  watchedCount,
  watchingCount,
  queuedCount,
  peakCount,
  newInVaultsCount,
}: StatsStripProps) {
  const stats: StatChip[] = [
    { label: "Watched", value: watchedCount, icon: <Eye size={14} />, color: "var(--green)" },
    { label: "Watching", value: watchingCount, icon: <Play size={14} />, color: "var(--blue)" },
    { label: "Queued", value: queuedCount, icon: <BookMarked size={14} />, color: "var(--yellow)" },
    { label: "Peak", value: peakCount, icon: <Zap size={14} />, color: "var(--accent)" },
    { label: "New", value: newInVaultsCount, icon: <Bell size={14} />, color: "var(--purple)" },
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide px-4">
      <div className="flex gap-2 pb-1 min-w-max">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/6 border border-white/8 shrink-0"
          >
            <span style={{ color: stat.color }}>{stat.icon}</span>
            <span className="text-sm font-bold text-[var(--text)]">{stat.value}</span>
            <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
