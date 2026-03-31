"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import { getGenreGradient } from "@/lib/utils/genre-gradients";
import { getImageWithFallback } from "@/lib/utils/image-fallback";
import { RATING_MAP, STATUS_MAP, type AnimeStatus } from "@/types/anime";
import { cn } from "@/lib/utils/cn";

interface AnimeCardProps {
  anime: {
    id?: string;
    mal_id?: number | null;
    title: string;
    cover_image?: string | null;
    genres?: string[] | null;
    year?: number | null;
    mal_score?: number | null;
    airing_status?: string | null;
    // Jikan-style fallbacks
    images?: { jpg?: { large_image_url?: string; image_url?: string } };
    score?: number | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  userAnimeData?: {
    rating?: 1 | 2 | 3 | 4 | 5 | null;
    vibes?: string[] | null;
    status?: AnimeStatus | null;
  } | null;
  priority?: boolean;
  className?: string;
}

export function AnimeCard({ anime, userAnimeData, priority = false, className }: AnimeCardProps) {
  const [imageError, setImageError] = useState(false);

  const malId = anime.mal_id;
  const href = malId ? `/anime/${malId}` : "#";

  const imageUrl = anime.cover_image
    || anime.images?.jpg?.large_image_url
    || anime.images?.jpg?.image_url
    || null;

  const genres = anime.genres || [];
  const gradient = getGenreGradient(genres);
  const score = anime.mal_score ?? anime.score ?? null;
  const userRating = userAnimeData?.rating;
  const firstVibe = userAnimeData?.vibes?.[0];
  const userStatus = userAnimeData?.status;
  const statusColor = userStatus ? STATUS_MAP[userStatus]?.color : null;

  return (
    <Link href={href} className={cn("group block press-feedback", className)}>
      <div className="w-full aspect-[2/3] relative rounded-2xl overflow-hidden shadow-lg">
        {imageUrl && !imageError ? (
          <Image
            src={getImageWithFallback(imageUrl)}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 480px) 30vw, 160px"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          >
            <span className="text-5xl opacity-20 select-none">{gradient.emoji}</span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Status dot */}
        {statusColor && (
          <div
            className="absolute top-2 left-2 w-2 h-2 rounded-full z-10 shadow-md"
            style={{ background: statusColor }}
          />
        )}

        {/* Vibe tag badge */}
        {firstVibe && (
          <div className="absolute top-2 left-5 z-10">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--purple)] text-white">
              {firstVibe}
            </span>
          </div>
        )}

        {/* MAL score */}
        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            <Star size={9} className="fill-amber-400" />
            {Number(score).toFixed(1)}
          </div>
        )}

        {/* User emoji rating */}
        {userRating && (
          <div className="absolute bottom-7 right-1.5 text-lg z-10">
            {RATING_MAP[userRating]?.emoji}
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
          <p className="text-xs font-semibold text-white leading-tight line-clamp-2">
            {anime.title}
          </p>
        </div>
      </div>
    </Link>
  );
}
