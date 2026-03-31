"use client";

import Link from "next/link";
import Image from "next/image";
import { getGenreGradient } from "@/lib/utils/genre-gradients";
import type { Recommendation } from "@/types/api";

interface RecommendationWithDetails extends Recommendation {
  anime?: {
    id: string;
    mal_id?: number | null;
    title: string;
    cover_image?: string | null;
    genres?: string[] | null;
  };
  from_user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface RecommendationsInboxProps {
  recommendations: RecommendationWithDetails[];
}

export function RecommendationsInbox({ recommendations }: RecommendationsInboxProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide px-4">
      <div className="flex gap-3 pb-1 min-w-max">
        {recommendations.map((rec) => {
          const anime = rec.anime;
          const sender = rec.from_user;
          if (!anime) return null;

          const gradient = getGenreGradient(anime.genres || []);
          const href = anime.mal_id ? `/anime/${anime.mal_id}` : "#";

          return (
            <Link key={rec.id} href={href} className="block shrink-0 w-32 press-feedback">
              <div className="rounded-2xl overflow-hidden relative aspect-[2/3]">
                {anime.cover_image ? (
                  <Image src={anime.cover_image} alt={anime.title} fill sizes="128px" className="object-cover" />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                  >
                    <span className="text-3xl opacity-20">{gradient.emoji}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                {/* Sender avatar */}
                {sender && (
                  <div
                    className="absolute top-2 left-2 w-7 h-7 rounded-full border-2 border-white/20 bg-black/40 flex items-center justify-center text-sm font-bold overflow-hidden"
                    title={`From ${sender.name}`}
                  >
                    {sender.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sender.avatar_url} alt={sender.name} className="w-full h-full object-cover" />
                    ) : (
                      sender.name.charAt(0).toUpperCase()
                    )}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[11px] font-semibold text-white line-clamp-2">{anime.title}</p>
                  {rec.message && (
                    <p className="text-[10px] text-white/60 mt-0.5 line-clamp-1">{rec.message}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
