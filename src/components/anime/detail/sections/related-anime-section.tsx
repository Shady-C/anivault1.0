import Link from "next/link";
import { EmptyState } from "@/components/content/empty-state";

interface RelationEntry {
  mal_id: number;
  name: string;
  type?: string;
}

interface Relation {
  relation: string;
  entry: RelationEntry[];
}

interface RelatedAnimeSectionProps {
  relationsData?: Relation[] | null;
}

export function RelatedAnimeSection({ relationsData }: RelatedAnimeSectionProps) {
  if (!relationsData || relationsData.length === 0) {
    return <EmptyState message="No related anime available." />;
  }

  return (
    <div className="space-y-3">
      {relationsData.map((relation, i) => (
        <div key={`${relation.relation}-${i}`} className="bg-white/4 rounded-xl p-3 border border-white/6">
          <div className="text-xs font-bold text-[var(--accent)] mb-1">{relation.relation}</div>
          <div className="flex flex-wrap gap-1.5">
            {relation.entry.map((entry) => (
              <Link
                key={entry.mal_id}
                href={`/anime/${entry.mal_id}`}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline"
              >
                {entry.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
