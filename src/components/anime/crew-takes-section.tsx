import { RATING_MAP, type UserAnimeData, type AnimeStatus, STATUS_MAP } from "@/types/anime";
import type { User } from "@/types/user";
import { Separator } from "@/components/ui/separator";

interface CrewTake {
  user: User;
  review: UserAnimeData;
}

interface CrewTakesSectionProps {
  takes: CrewTake[];
}

export function CrewTakesSection({ takes }: CrewTakesSectionProps) {
  if (takes.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        None of the crew have rated this yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {takes.map((take, i) => {
        const { user, review } = take;
        const ratingInfo = review.rating ? RATING_MAP[review.rating] : null;
        const statusInfo = review.status ? STATUS_MAP[review.status as AnimeStatus] : null;

        return (
          <div key={user.id}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="flex items-start gap-3">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl shrink-0 object-cover border border-[var(--card-border)]"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold bg-white/10">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text)]">{user.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {ratingInfo && (
                    <span className="text-base">{ratingInfo.emoji}</span>
                  )}
                  {statusInfo && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${statusInfo.color}22`, color: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  )}
                  {(review.vibes || []).map((vibe) => (
                    <span
                      key={vibe}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--purple)]/20 text-[var(--purple)]"
                    >
                      {vibe}
                    </span>
                  ))}
                </div>
                {review.hot_take && (
                  <p className="text-sm text-[var(--text-muted)] mt-1.5 italic">
                    &ldquo;{review.hot_take}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
