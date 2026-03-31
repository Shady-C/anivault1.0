import { EmptyState } from "@/components/content/empty-state";

interface ThemeSongsSectionProps {
  themesData?: {
    openings?: string[];
    endings?: string[];
  } | null;
}

export function ThemeSongsSection({ themesData }: ThemeSongsSectionProps) {
  const hasOpenings = (themesData?.openings?.length ?? 0) > 0;
  const hasEndings = (themesData?.endings?.length ?? 0) > 0;

  if (!hasOpenings && !hasEndings) {
    return <EmptyState message="No theme songs available." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--text)] mb-2">Opening Themes</h3>
        {hasOpenings ? (
          <ul className="space-y-1">
            {themesData!.openings!.map((opening, i) => (
              <li key={i} className="pl-3 border-l-2 border-[var(--accent)]/40 text-xs text-[var(--text-muted)] py-0.5">
                {opening}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No opening themes.</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[var(--text)] mb-2">Ending Themes</h3>
        {hasEndings ? (
          <ul className="space-y-1">
            {themesData!.endings!.map((ending, i) => (
              <li key={i} className="pl-3 border-l-2 border-[var(--purple)]/40 text-xs text-[var(--text-muted)] py-0.5">
                {ending}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No ending themes.</p>
        )}
      </div>
    </div>
  );
}
