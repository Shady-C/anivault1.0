"use client";

import { cn } from "@/lib/utils/cn";

interface DayFilterTabsProps {
  activeDay: string;
  onDayChange: (day: string) => void;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "other"];

export function DayFilterTabs({ activeDay, onDayChange }: DayFilterTabsProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  return (
    <div className="overflow-x-auto scrollbar-hide px-4">
      <div className="flex gap-2 pb-1 min-w-max">
        {DAYS.map((day) => {
          const isToday = day === today;
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all press-feedback relative",
                isActive
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "bg-white/8 text-[var(--text-muted)] hover:bg-white/12"
              )}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
              {isToday && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--green)] animate-pulse-scale" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
