"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/anime/detail/section-card";
import { TrailerSection } from "@/components/anime/detail/sections/trailer-section";
import { CharactersSection } from "@/components/anime/detail/sections/characters-section";
import { ThemeSongsSection } from "@/components/anime/detail/sections/theme-songs-section";
import { EpisodesSection } from "@/components/anime/detail/sections/episodes-section";
import { RelatedAnimeSection } from "@/components/anime/detail/sections/related-anime-section";

interface ContentSectionsProps {
  contentData: {
    animeId: string;
    synopsis?: string | null;
    trailersData?: { embed_url?: string | null; youtube_id?: string | null } | null;
    themesData?: { openings?: string[]; endings?: string[] } | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charactersData?: any[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    episodesData?: any[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationsData?: any[] | null;
    // AniVault sections - rendered via separate lazy-loaded components
    watchSourcesSlot?: React.ReactNode;
    yourReviewSlot?: React.ReactNode;
    crewTakesSlot?: React.ReactNode;
  };
}

export function AnimeContentSections({ contentData }: ContentSectionsProps) {
  const {
    synopsis, trailersData, themesData, charactersData, episodesData, relationsData,
    watchSourcesSlot, yourReviewSlot, crewTakesSlot,
  } = contentData;

  const [showMore, setShowMore] = useState(false);
  const [showCharactersAll, setShowCharactersAll] = useState(false);
  const synopsisRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLDivElement>(null);

  const characterGroups = useMemo(() => ({
    main: (charactersData || []).filter((c) => c.role === "Main"),
    supporting: (charactersData || []).filter((c) => c.role === "Supporting"),
    limited: (charactersData || []).slice(0, 8),
  }), [charactersData]);

  const handleViewAllChars = useCallback(() => {
    setShowCharactersAll(true);
    synopsisRef.current?.scrollIntoView({ block: "end" });
  }, []);

  const handleBackToOverview = useCallback(() => {
    setShowCharactersAll(false);
    setTimeout(() => charsRef.current?.scrollIntoView({ block: "start" }));
  }, []);

  if (showCharactersAll) {
    return (
      <div className="space-y-4">
        <SectionCard
          title="Characters & Voice Actors"
          headerActions={
            <Button variant="ghost" size="sm" onClick={handleBackToOverview} className="text-xs">
              Back
            </Button>
          }
        >
          <CharactersSection characters={charactersData} />
        </SectionCard>
      </div>
    );
  }

  const synopsisText = synopsis || "No synopsis available.";
  const truncated = synopsisText.length > 300;
  const displayText = truncated && !showMore ? synopsisText.slice(0, 300) + "..." : synopsisText;

  return (
    <div className="space-y-4">
      {/* 1. Synopsis */}
      <SectionCard title="Synopsis" cardRef={synopsisRef as React.RefObject<HTMLDivElement>}>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
          {displayText}
        </p>
        {truncated && (
          <button
            onClick={() => setShowMore(m => !m)}
            className="mt-2 text-xs text-[var(--accent)] font-medium"
          >
            {showMore ? "Show less" : "Read more"}
          </button>
        )}
      </SectionCard>

      {/* 2. Trailer */}
      <SectionCard title="Trailer" accentColor="var(--red)">
        <TrailerSection trailersData={trailersData} />
      </SectionCard>

      {/* 3. Watch Sources (AniVault-specific) */}
      {watchSourcesSlot && (
        <SectionCard title="Watch Sources" accentColor="var(--cyan)">
          {watchSourcesSlot}
        </SectionCard>
      )}

      {/* 4. Your Review (AniVault-specific) */}
      {yourReviewSlot && (
        <SectionCard title="Your Review" accentColor="var(--accent)">
          {yourReviewSlot}
        </SectionCard>
      )}

      {/* 5. Crew's Takes (AniVault-specific) */}
      {crewTakesSlot && (
        <SectionCard title="Crew's Takes" accentColor="var(--purple)">
          {crewTakesSlot}
        </SectionCard>
      )}

      {/* 6. Characters & VAs */}
      <SectionCard
        title="Characters & Voice Actors"
        cardRef={charsRef as React.RefObject<HTMLDivElement>}
        headerActions={
          (charactersData?.length ?? 0) > 8 ? (
            <Button variant="ghost" size="sm" onClick={handleViewAllChars} className="text-xs">
              View All ({charactersData!.length})
            </Button>
          ) : undefined
        }
      >
        <CharactersSection characters={characterGroups.limited} />
      </SectionCard>

      {/* 7. Theme Songs */}
      <SectionCard title="Theme Songs" accentColor="var(--yellow)">
        <ThemeSongsSection themesData={themesData} />
      </SectionCard>

      {/* 8. Episodes */}
      <SectionCard title="Episodes" accentColor="var(--blue)">
        <EpisodesSection episodes={episodesData} />
      </SectionCard>

      {/* 9. Related Anime */}
      <SectionCard title="Related Anime" accentColor="var(--green)">
        <RelatedAnimeSection relationsData={relationsData} />
      </SectionCard>
    </div>
  );
}
