import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
}

export function SectionHeader({ title, subtitle, viewAllLink, viewAllLabel = "See all" }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3 px-4">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          {title}
        </h2>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="flex items-center gap-0.5 text-xs text-[var(--accent)] font-medium"
        >
          {viewAllLabel}
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
