"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getUserAnimeList } from "@/lib/api/anime";
import { ArrowLeft, Download } from "lucide-react";

interface MALAnimeItem {
  mal_id: number;
  title: string;
  score?: number;
  status?: string;
  episodes_watched?: number;
  cover_image?: string;
  genres?: string[];
}

export default function MALImportPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [animeList, setAnimeList] = useState<MALAnimeItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const handleFetch = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);

    const { data, error } = await getUserAnimeList(username.trim());
    setLoading(false);

    if (error) {
      setError("Couldn't load that MAL profile. Make sure it's public.");
      return;
    }

    const items = (data as unknown[]).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      const node = i.node as Record<string, unknown>;
      const mainPicture = node?.main_picture as Record<string, string> | null;
      return {
        mal_id: node?.id as number,
        title: (node?.title as string) || "Unknown",
        score: (i.list_status as Record<string, unknown>)?.score as number | undefined,
        status: (i.list_status as Record<string, unknown>)?.status as string | undefined,
        cover_image: mainPicture?.medium ?? null,
        genres: [] as string[],
      } as MALAnimeItem;
    });

    setAnimeList(items);
    setSelected(new Set(items.map(a => a.mal_id)));
  };

  const toggleSelect = (malId: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(malId)) next.delete(malId);
      else next.add(malId);
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    // import logic wired from server action
    const selectedAnime = animeList.filter(a => selected.has(a.mal_id));
    const response = await fetch("/api/import/mal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anime: selectedAnime }),
    });
    setImporting(false);
    if (response.ok) {
      setImportDone(true);
      setTimeout(() => router.push("/"), 1500);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/5">
          <ArrowLeft size={20} className="text-[var(--text)]" />
        </button>
        <PageHeader title="MAL Import" className="flex-1 py-0" />
      </div>

      <div className="px-4 space-y-5 mt-2">
        {importDone ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-[var(--text)]">Import Complete!</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Redirecting to home...</p>
          </div>
        ) : (
          <>
            <div className="rounded-3xl bg-[var(--card)] border border-[var(--card-border)] p-5">
              <h2 className="text-base font-bold text-[var(--text)] mb-1">Import from MyAnimeList</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Enter your MAL username to import your completed anime list.
                Your list must be set to public.
              </p>
              <div className="flex gap-2">
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="MAL username"
                  className="flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleFetch(); }}
                />
                <Button onClick={handleFetch} disabled={loading} size="sm">
                  {loading ? "..." : "Fetch"}
                </Button>
              </div>
              {error && <p className="text-xs text-[var(--red)] mt-2">{error}</p>}
            </div>

            {animeList.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--text-muted)]">
                    {selected.size} / {animeList.length} selected
                  </p>
                  <button
                    className="text-xs text-[var(--accent)]"
                    onClick={() => {
                      if (selected.size === animeList.length) setSelected(new Set());
                      else setSelected(new Set(animeList.map(a => a.mal_id)));
                    }}
                  >
                    {selected.size === animeList.length ? "Deselect all" : "Select all"}
                  </button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {animeList.map(anime => (
                    <button
                      key={anime.mal_id}
                      onClick={() => toggleSelect(anime.mal_id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left press-feedback"
                      style={{
                        background: selected.has(anime.mal_id) ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.04)",
                        borderColor: selected.has(anime.mal_id) ? "rgba(255,107,53,0.3)" : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected.has(anime.mal_id)
                            ? "bg-[var(--accent)] border-[var(--accent)]"
                            : "border-white/20"
                        }`}
                      >
                        {selected.has(anime.mal_id) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">{anime.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {anime.status} {anime.score ? `· ⭐ ${anime.score}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={handleImport}
                  disabled={importing || selected.size === 0}
                >
                  <Download size={16} className="mr-2" />
                  {importing ? "Importing..." : `Import ${selected.size} Anime`}
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
