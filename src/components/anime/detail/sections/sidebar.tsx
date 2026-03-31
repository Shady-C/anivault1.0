import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SidebarSection = ({ title, children, condition = true }: { title: string; children: React.ReactNode; condition?: boolean }) => {
  if (!condition) return null;
  return (
    <div className="py-3">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{title}</span>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
};

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 text-xs">
    <span className="text-[var(--text-muted)] shrink-0">{label}</span>
    <span className="font-medium text-right text-[var(--text)]">{children}</span>
  </div>
);

interface SidebarData {
  titleJapanese?: string | null;
  titleSynonyms?: string[];
  status?: string | null;
  episodes?: number | null;
  rating?: string | null;
  season?: string | null;
  year?: number | null;
  aired?: { string?: string } | null;
  duration?: string | null;
  broadcast?: { string?: string } | null;
  studios?: Array<{ mal_id?: number; name: string }>;
  producers?: Array<{ mal_id?: number; name: string }>;
  licensors?: Array<{ mal_id?: number; name: string }>;
  source?: string | null;
  genres?: Array<{ mal_id?: number; name: string }>;
  themes?: Array<{ mal_id?: number; name: string }>;
  demographics?: Array<{ mal_id?: number; name: string }>;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  favorites?: number | null;
}

export function AnimeSidebar({ sidebarData }: { sidebarData: SidebarData }) {
  const {
    titleJapanese, titleSynonyms, status, episodes, rating, season, year,
    aired, duration, broadcast, studios, producers, licensors,
    source, genres, themes, demographics, rank, popularity, members, favorites,
  } = sidebarData;

  const formatNum = (n?: number | null) => n ? n.toLocaleString() : "N/A";
  const formatRank = (n?: number | null) => n ? `#${n}` : "N/A";

  return (
    <Card className="py-0">
      <CardContent className="p-4 space-y-0 divide-y divide-white/6">
        <SidebarSection title="Alternative Titles" condition={!!(titleJapanese || titleSynonyms?.length)}>
          {titleJapanese && (
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Japanese</span>
              <div className="text-xs text-[var(--text)]">{titleJapanese}</div>
            </div>
          )}
          {(titleSynonyms?.length ?? 0) > 0 && (
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Synonyms</span>
              {titleSynonyms!.map((t, i) => <div key={i} className="text-xs text-[var(--text)]">{t}</div>)}
            </div>
          )}
        </SidebarSection>

        <SidebarSection title="Basic Info">
          <InfoRow label="Status">{status || "N/A"}</InfoRow>
          <InfoRow label="Episodes">{episodes ?? "?"}</InfoRow>
          {rating && <InfoRow label="Rating">{rating}</InfoRow>}
          {season && <InfoRow label="Season">{`${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`}</InfoRow>}
          {aired?.string && <InfoRow label="Aired">{aired.string}</InfoRow>}
          {duration && <InfoRow label="Duration">{duration}</InfoRow>}
          {broadcast?.string && <InfoRow label="Broadcast">{broadcast.string}</InfoRow>}
        </SidebarSection>

        <SidebarSection title="Credits" condition={!!((studios?.length ?? 0) + (producers?.length ?? 0) + (licensors?.length ?? 0))}>
          {(studios?.length ?? 0) > 0 && <InfoRow label="Studio">{studios!.map(s => s.name).join(", ")}</InfoRow>}
          {(producers?.length ?? 0) > 0 && (
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)] shrink-0">Producers</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {producers!.map(p => (
                  <Badge key={p.mal_id ?? p.name} variant="outline" className="text-[10px] h-5">{p.name}</Badge>
                ))}
              </div>
            </div>
          )}
          {(licensors?.length ?? 0) > 0 && <InfoRow label="Licensors">{licensors!.map(l => l.name).join(", ")}</InfoRow>}
        </SidebarSection>

        <SidebarSection title="Details">
          <InfoRow label="Source">{source || "N/A"}</InfoRow>
          {(genres?.length ?? 0) > 0 && (
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)] shrink-0">Genres</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {genres!.map(g => (
                  <Badge key={g.mal_id ?? g.name} variant="outline" className="text-[10px] h-5">{g.name}</Badge>
                ))}
              </div>
            </div>
          )}
          {(themes?.length ?? 0) > 0 && (
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)] shrink-0">Themes</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {themes!.map(t => (
                  <Badge key={t.mal_id ?? t.name} variant="outline" className="text-[10px] h-5">{t.name}</Badge>
                ))}
              </div>
            </div>
          )}
          {(demographics?.length ?? 0) > 0 && (
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)] shrink-0">Demographics</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {demographics!.map(d => (
                  <Badge key={d.mal_id ?? d.name} variant="outline" className="text-[10px] h-5">{d.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </SidebarSection>

        <SidebarSection title="Statistics">
          <InfoRow label="Rank">{formatRank(rank)}</InfoRow>
          <InfoRow label="Popularity">{formatRank(popularity)}</InfoRow>
          <InfoRow label="Members">{formatNum(members)}</InfoRow>
          <InfoRow label="Favorites">{formatNum(favorites)}</InfoRow>
        </SidebarSection>
      </CardContent>
    </Card>
  );
}
