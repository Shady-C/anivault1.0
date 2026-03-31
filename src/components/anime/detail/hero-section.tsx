"use client";

import Image from "next/image";
import { Star, Calendar, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGenreGradient } from "@/lib/utils/genre-gradients";
import { RATING_MAP, type AnimeStatus } from "@/types/anime";
import { formatNumber } from "@/lib/utils/formatter";

interface Studio {
  mal_id?: number;
  name: string;
}

interface AnimeHeroData {
  imageUrl?: string | null;
  title: string;
  titleEnglish?: string | null;
  titleJapanese?: string | null;
  titleSynonyms?: string[];
  type?: string | null;
  status?: string | null;
  score?: number | null;
  scoredBy?: number | null;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  season?: string | null;
  year?: number | null;
  studios?: Studio[];
  schedules?: string | null;
  genres?: string[];
  // AniVault additions
  userRating?: 1 | 2 | 3 | 4 | 5 | null;
  userStatus?: AnimeStatus | null;
  vaultCount?: number;
  vaultName?: string;
}

interface AnimeHeroSectionProps {
  heroData: AnimeHeroData;
  onAddToVault?: () => void;
}

function AnimeBackground({ imageUrl, title, genres }: { imageUrl?: string | null; title: string; genres?: string[] }) {
  const gradient = getGenreGradient(genres);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {imageUrl ? (
          <div className="absolute inset-0 scale-110 hover:scale-125 transition-transform duration-[15s] ease-linear">
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              className="object-cover opacity-25 blur-[12px]"
              sizes="480px"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[120px] opacity-10 select-none">
              {gradient.emoji}
            </span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/70 to-[var(--background)]/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 to-transparent" />
    </>
  );
}

function getStatusStyle(status?: string | null) {
  const s = status?.toLowerCase();
  if (s?.includes("finished") || s?.includes("completed")) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s?.includes("airing") || s?.includes("currently")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (s?.includes("not yet")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-white/10 text-[var(--text-muted)] border-white/10";
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/8 flex flex-col items-center justify-center min-w-0">
      <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</div>
      <div className="font-bold text-sm text-[var(--text)] truncate">{value}</div>
    </div>
  );
}

export function AnimeHeroSection({ heroData, onAddToVault }: AnimeHeroSectionProps) {
  const {
    imageUrl, title, titleEnglish, titleJapanese, titleSynonyms,
    type, status, score, scoredBy, rank, popularity, members,
    season, year, studios, schedules,
    genres = [], userRating, vaultCount, vaultName,
  } = heroData;

  const altTitle = titleEnglish && titleEnglish !== title
    ? titleEnglish
    : (titleJapanese || titleSynonyms?.[0] || "");

  const displayStatus = status?.includes("Currently") ? "Airing" : status;
  const gradient = getGenreGradient(genres);

  const addToVaultLabel = vaultCount === 0 || !vaultCount
    ? "Add to Vault"
    : vaultCount === 1
    ? `In ${vaultName ?? "Vault"} ✓`
    : `In ${vaultCount} Vaults ✓`;

  const isInVault = (vaultCount ?? 0) > 0;

  return (
    <section className="w-full min-h-[340px] relative overflow-hidden">
      <AnimeBackground imageUrl={imageUrl} title={title} genres={genres} />

      <div className="relative z-10 px-4 pb-6 pt-16">
        <div className="flex gap-4 items-end">
          {/* Poster */}
          <div className="shrink-0">
            <div className="w-28 h-40 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                >
                  <span className="text-4xl opacity-30">{gradient.emoji}</span>
                </div>
              )}
              {userRating && (
                <div className="absolute bottom-1 right-1 text-xl">
                  {RATING_MAP[userRating]?.emoji}
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="w-full mt-2 text-xs h-9"
              variant={isInVault ? "secondary" : "default"}
              onClick={onAddToVault}
            >
              {isInVault ? <Check size={13} className="mr-1" /> : <Plus size={13} className="mr-1" />}
              {addToVaultLabel}
            </Button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {type && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  {type}
                </Badge>
              )}
              {displayStatus && (
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border ${getStatusStyle(status)}`}>
                  {displayStatus}
                </Badge>
              )}
              {schedules && status?.toLowerCase().includes("airing") && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Calendar size={9} className="mr-1" />
                  {schedules.charAt(0).toUpperCase() + schedules.slice(1)}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-black text-[var(--text)] leading-tight line-clamp-2" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              {title}
            </h1>
            {altTitle && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{altTitle}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {score && (
                <span className="flex items-center gap-1 text-xs bg-white/8 rounded-full px-2.5 py-1 text-amber-400">
                  <Star size={10} className="fill-amber-400" />
                  {Number(score).toFixed(2)}
                  {scoredBy && <span className="text-[var(--text-muted)]">({formatNumber(scoredBy)})</span>}
                </span>
              )}
              {season && year && (
                <span className="text-xs bg-white/8 rounded-full px-2.5 py-1 text-[var(--text-muted)]">
                  {season.charAt(0).toUpperCase() + season.slice(1)} {year}
                </span>
              )}
              {studios?.[0] && (
                <span className="text-xs bg-white/8 rounded-full px-2.5 py-1 text-[var(--text-muted)]">
                  {studios[0].name}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {score && <StatCard label="Score" value={Number(score).toFixed(1)} />}
              {rank && <StatCard label="Rank" value={`#${rank}`} />}
              {popularity && <StatCard label="Pop." value={`#${popularity}`} />}
              {members && !popularity && <StatCard label="Members" value={formatNumber(members)} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
