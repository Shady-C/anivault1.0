"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";
import { getGenreGradient } from "@/lib/utils/genre-gradients";

interface SearchAnimeResult {
  mal_id: number;
  title: string;
  title_english?: string | null;
  images?: { jpg?: { small_image_url?: string; image_url?: string }; webp?: { small_image_url?: string } };
  year?: number | null;
  score?: number | null;
  type?: string | null;
  genres?: Array<{ name: string }>;
  // local DB result
  cover_image?: string | null;
  mal_score?: number | null;
}

interface GlobalSearchProps {
  autoFocus?: boolean;
  onResultClick?: (anime: SearchAnimeResult) => void;
}

async function dualSearch(query: string): Promise<SearchAnimeResult[]> {
  const [localRes, jikanRes] = await Promise.allSettled([
    fetch(`/api/search/local?q=${encodeURIComponent(query)}`).then(r => r.json()),
    fetch(`/api/search/jikan?q=${encodeURIComponent(query)}`).then(r => r.json()),
  ]);

  const local: SearchAnimeResult[] = localRes.status === "fulfilled" ? localRes.value?.data || [] : [];
  const jikan: SearchAnimeResult[] = jikanRes.status === "fulfilled" ? jikanRes.value?.data || [] : [];

  const seenMalIds = new Set(local.map((a) => a.mal_id).filter(Boolean));
  const deduped = jikan.filter((a) => !seenMalIds.has(a.mal_id));

  return [...local, ...deduped].slice(0, 15);
}

export function GlobalSearch({ autoFocus = false, onResultClick }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 700);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchAnimeResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`search-item-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (debouncedQuery.length < 2) {
      return;
    }

    dualSearch(debouncedQuery)
      .then((data) => { if (mounted) setResults(data); })
      .catch(() => { if (mounted) setResults([]); })
      .finally(() => { if (mounted) setIsLoading(false); });

    return () => { mounted = false; };
  }, [debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    setActiveIndex(-1);
    const shouldOpen = nextQuery.length >= 2;
    setIsOpen(shouldOpen);
    if (!shouldOpen) {
      setResults([]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, -1)); }
    else if (e.key === "Escape") { setIsOpen(false); }
    else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const anime = results[activeIndex];
      if (anime) handleSelect(anime);
    }
  };

  const handleSelect = (anime: SearchAnimeResult) => {
    setIsOpen(false);
    if (onResultClick) {
      onResultClick(anime);
    } else {
      router.push(`/anime/${anime.mal_id}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] h-4 w-4 pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          placeholder="Search anime..."
          className="pl-10 pr-4"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--text-muted)]" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full mt-1 w-full rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto border border-white/8"
          style={{ background: "rgba(14, 14, 24, 0.97)", backdropFilter: "blur(20px)" }}
        >
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-sm text-[var(--text-muted)] text-center">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 space-y-2">
              <p className="text-sm text-[var(--text-muted)] text-center">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[var(--text-dim)] text-center">
                Can&apos;t find it?{" "}
                <button
                  className="text-[var(--accent)] underline"
                  onClick={() => router.push("/search/manual")}
                >
                  Add it manually
                </button>
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {results.map((anime, i) => {
                const imgSrc = anime.cover_image
                  || anime.images?.webp?.small_image_url
                  || anime.images?.jpg?.small_image_url
                  || null;
                const genres = (anime.genres || []).map((g) => g.name);
                const gradient = getGenreGradient(genres);
                const score = anime.mal_score ?? anime.score;

                return (
                  <button
                    id={`search-item-${i}`}
                    role="option"
                    aria-selected={activeIndex === i}
                    key={`${anime.mal_id}-${i}`}
                    onClick={() => handleSelect(anime)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left ${
                      activeIndex === i ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="shrink-0 w-9 h-[52px] rounded-lg overflow-hidden relative">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={anime.title} fill sizes="36px" className="object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                        >
                          <span className="text-xl opacity-40">{gradient.emoji}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] line-clamp-1">{anime.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {anime.type || "Anime"} · {anime.year || "TBA"}
                        {score ? ` · ⭐ ${Number(score).toFixed(1)}` : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
