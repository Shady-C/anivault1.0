"use client";

import { Button } from "@/components/ui/button";

type EmptyStateType =
  | "anime"
  | "search"
  | "error"
  | "generic"
  | "vault"
  | "following"
  | "recommendations";

interface EmptyStateConfig {
  title: string;
  description: string;
}

interface EmptyStateProps {
  type?: EmptyStateType;
  message?: string;
  showButton?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function EmptyState({
  type = "generic",
  message,
  showButton = false,
  onRetry,
  className = "",
}: EmptyStateProps) {
  const configs: Record<EmptyStateType, EmptyStateConfig> = {
    anime: {
      title: "No Anime Found",
      description: "Try adjusting your filters or search terms.",
    },
    search: {
      title: "No Results Found",
      description: "Try different search terms.",
    },
    error: {
      title: "Something went wrong",
      description: "We couldn't load the data. Please try again.",
    },
    generic: {
      title: "No Data Available",
      description: "There's nothing to show right now.",
    },
    vault: {
      title: "No Anime Yet",
      description: "Add some anime to this vault to get started.",
    },
    following: {
      title: "Not Following Any Shows",
      description: "Browse All Shows to start following.",
    },
    recommendations: {
      title: "No Recommendations",
      description: "Your crew hasn't sent you any recs yet.",
    },
  };

  const config = configs[type] || configs.generic;

  if (message && !className) {
    return <div className="text-[var(--text-muted)] text-sm">{message}</div>;
  }

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">{message || config.title}</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">{config.description}</p>
        {showButton && onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-3">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
