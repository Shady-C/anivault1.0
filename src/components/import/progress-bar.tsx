"use client";

interface ProgressBarProps {
  progress: {
    total: number;
    completed: number;
    currentTitle: string;
    isRunning: boolean;
  };
}

export default function ImportProgressBar({ progress }: ProgressBarProps) {
  const { total, completed, currentTitle } = progress;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(total - completed, 0);
  const etaSeconds = Math.ceil(remaining * 1.6);

  return (
    <div className="mb-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="mb-2 flex justify-between text-sm text-[var(--text)]">
        <span>
          Fetching: {completed} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-alt)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {currentTitle ? `Current: ${currentTitle}` : "Idle"} | ETA: ~{etaSeconds}s
      </p>
    </div>
  );
}
