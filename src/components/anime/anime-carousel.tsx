"use client";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { AnimeCard } from "@/components/anime/anime-card";
import type { UserAnimeData } from "@/types/anime";

interface AnimeCarouselProps {
  animes: Array<{
    id?: string;
    mal_id?: number | null;
    title: string;
    cover_image?: string | null;
    genres?: string[] | null;
    year?: number | null;
    mal_score?: number | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
  userAnimeDataMap?: Record<string, UserAnimeData>;
  trailingSlot?: React.ReactNode;
}

export function AnimeCarousel({ animes, userAnimeDataMap = {}, trailingSlot }: AnimeCarouselProps) {
  if (animes.length === 0) return null;

  return (
    <div className="relative px-4">
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-2">
          {animes.map((anime, i) => {
            const key = anime.id || anime.mal_id || i;
            const userAnimeData = anime.id ? userAnimeDataMap[anime.id] : undefined;
            return (
              <CarouselItem key={key} className="pl-2 basis-[42%] sm:basis-[30%]">
                <AnimeCard anime={anime} userAnimeData={userAnimeData} priority={i < 4} />
              </CarouselItem>
            );
          })}
          {trailingSlot && (
            <CarouselItem className="pl-2 basis-[42%] sm:basis-[30%]">
              {trailingSlot}
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
