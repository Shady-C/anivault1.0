"use client";

import { useState } from "react";
import { AnimeHeroSection } from "@/components/anime/detail/hero-section";
import { AnimeSidebar } from "@/components/anime/detail/sections/sidebar";
import { AnimeContentSections } from "@/components/anime/detail/sections/content-sections";
import { VaultChecklistSheet } from "@/components/vault/vault-checklist-sheet";
import { WatchSourcesSection } from "@/components/anime/watch-sources-section";
import { YourReviewSection } from "@/components/anime/your-review-section";
import { CrewTakesSection } from "@/components/anime/crew-takes-section";
import { BottomNav } from "@/components/layout/bottom-nav";
import type { Anime, UserAnimeData, AnimeStatus, AnimeWatchSource } from "@/types/anime";
import type { VaultWithMembers } from "@/types/vault";

interface AnimeDetailClientProps {
  anime: Anime | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trailersData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themesData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  charactersData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  episodesData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relationsData: any[];
  watchSources: AnimeWatchSource[];
  vaults: VaultWithMembers[];
  checkedVaultIds: string[];
  userAnimeData: UserAnimeData | null;
  currentUserId?: string;
}

export function AnimeDetailClient({
  anime,
  heroData,
  sidebarData,
  trailersData,
  themesData,
  charactersData,
  episodesData,
  relationsData,
  watchSources: initialWatchSources,
  vaults,
  checkedVaultIds: initialCheckedVaultIds,
  userAnimeData: initialUserAnimeData,
}: AnimeDetailClientProps) {
  const [vaultSheetOpen, setVaultSheetOpen] = useState(false);
  const [checkedVaultIds, setCheckedVaultIds] = useState(initialCheckedVaultIds);
  const [watchSources, setWatchSources] = useState(initialWatchSources);
  const [userAnimeData, setUserAnimeData] = useState<UserAnimeData | null>(initialUserAnimeData);
  const [crewTakes] = useState<never[]>([]);

  const handleVaultToggle = async (vaultId: string, add: boolean) => {
    if (!anime) return;
    await fetch(`/api/vaults/${vaultId}/anime`, {
      method: add ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId: anime.id }),
    });
    setCheckedVaultIds(prev =>
      add ? [...prev, vaultId] : prev.filter(id => id !== vaultId)
    );
  };

  const handleAddSource = async (url: string) => {
    if (!anime) return;
    const res = await fetch("/api/anime/watch-sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId: anime.id, url }),
    });
    const json = await res.json();
    if (json.data) {
      setWatchSources(prev => [...prev, json.data]);
    }
  };

  const handleReviewUpdate = async (updates: {
    status?: AnimeStatus | null;
    rating?: 1 | 2 | 3 | 4 | 5 | null;
    vibes?: string[] | null;
    hot_take?: string | null;
  }) => {
    if (!anime) return;
    const res = await fetch("/api/anime/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId: anime.id, ...updates }),
    });
    const json = await res.json();
    if (json.data) setUserAnimeData(json.data);
  };

  if (!heroData || !sidebarData) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Loading anime data...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <AnimeHeroSection
        heroData={{
          ...heroData,
          vaultCount: checkedVaultIds.length,
          userRating: userAnimeData?.rating ?? null,
          userStatus: userAnimeData?.status ?? null,
        }}
        onAddToVault={() => setVaultSheetOpen(true)}
      />

      {/* Two-column grid: sidebar + content */}
      <div className="px-4 mt-4">
        <div className="space-y-4">
          {/* Sidebar first on mobile */}
          {sidebarData && <AnimeSidebar sidebarData={sidebarData} />}

          {/* Content sections */}
          <AnimeContentSections
            contentData={{
              animeId: anime?.id || "",
              synopsis: heroData.synopsis ?? null,
              trailersData,
              themesData,
              charactersData,
              episodesData,
              relationsData,
              watchSourcesSlot: (
                <WatchSourcesSection
                  sources={watchSources}
                  onAdd={handleAddSource}
                />
              ),
              yourReviewSlot: (
                <YourReviewSection
                  animeId={anime?.id || ""}
                  initialStatus={userAnimeData?.status}
                  initialRating={userAnimeData?.rating}
                  initialVibes={userAnimeData?.vibes}
                  initialHotTake={userAnimeData?.hot_take}
                  hasVaultMates={vaults.some(v => v.members.length > 1)}
                  onUpdate={handleReviewUpdate}
                />
              ),
              crewTakesSlot: crewTakes.length > 0 ? (
                <CrewTakesSection takes={crewTakes} />
              ) : undefined,
            }}
          />
        </div>
      </div>

      {/* Vault Checklist Sheet */}
      {anime && (
        <VaultChecklistSheet
          isOpen={vaultSheetOpen}
          onClose={() => setVaultSheetOpen(false)}
          animeId={anime.id}
          animeTitle={anime.title}
          vaults={vaults}
          checkedVaultIds={checkedVaultIds}
          onToggle={handleVaultToggle}
        />
      )}

      <BottomNav />
    </div>
  );
}
