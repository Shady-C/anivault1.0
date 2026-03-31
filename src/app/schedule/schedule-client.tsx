"use client";

import { useState, useEffect } from "react";
import { DayFilterTabs } from "@/components/schedule/day-filter-tabs";
import { AnimeCard } from "@/components/anime/anime-card";
import { getSeasonLabel } from "@/lib/utils/season";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VIEW_MODES = [
  { key: "by-day", label: "By Day" },
  { key: "all-shows", label: "All Shows" },
  { key: "following", label: "Following" },
] as const;

type ViewMode = "by-day" | "all-shows" | "following";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function ScheduleClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("by-day");
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return DAYS.includes(today) ? today : "monday";
  });

  const [allShows, setAllShows] = useState<Record<string, unknown[]>>({});
  const [followedShows, setFollowedShows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seasonLabel = getSeasonLabel();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [schedRes, followRes] = await Promise.allSettled([
          fetch("/api/schedule").then(r => r.json()),
          fetch("/api/following").then(r => r.json()),
        ]);

        if (!mounted) return;

        if (schedRes.status === "fulfilled") {
          setAllShows(schedRes.value?.byDay || {});
        } else {
          setError("Couldn't load schedule. Try again.");
        }

        if (followRes.status === "fulfilled") {
          setFollowedShows(followRes.value?.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const dayShows = allShows[activeDay] || [];

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1
          className="text-2xl font-black text-[var(--text)]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Schedule
        </h1>
        <span className="text-xs text-[var(--text-muted)] bg-white/5 px-3 py-1 rounded-full">
          {seasonLabel}
        </span>
      </div>

      {/* View mode pills */}
      <div className="px-4 mb-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="w-full">
            {VIEW_MODES.map(({ key, label }) => (
              <TabsTrigger key={key} value={key} className="flex-1">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* By Day */}
          <TabsContent value="by-day">
            <DayFilterTabs activeDay={activeDay} onDayChange={setActiveDay} />
            {loading ? (
              <div className="px-4 py-4 text-sm text-[var(--text-muted)]">Loading...</div>
            ) : error ? (
              <div className="px-4 py-4 text-sm text-[var(--red)]">{error}</div>
            ) : dayShows.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                No shows airing on {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}.
              </div>
            ) : (
              <div className="px-4 grid grid-cols-3 gap-3 mt-4">
                {dayShows.map((anime, i) => (
                  <AnimeCard key={i} anime={anime as never} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Shows */}
          <TabsContent value="all-shows">
            {loading ? (
              <div className="px-4 py-4 text-sm text-[var(--text-muted)]">Loading...</div>
            ) : (
              <div className="px-4 grid grid-cols-3 gap-3 mt-4">
                {DAYS.flatMap(day => allShows[day] || []).map((anime, i) => (
                  <AnimeCard key={i} anime={anime as never} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Following */}
          <TabsContent value="following">
            {loading ? (
              <div className="px-4 py-4 text-sm text-[var(--text-muted)]">Loading...</div>
            ) : followedShows.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-4xl mb-3">📡</p>
                <p className="text-sm text-[var(--text-muted)]">
                  You&apos;re not following any shows yet. Tap a show in All Shows to follow it.
                </p>
              </div>
            ) : (
              <div className="px-4 grid grid-cols-3 gap-3 mt-4">
                {followedShows.map((anime, i) => (
                  <AnimeCard key={i} anime={anime as never} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
