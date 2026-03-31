import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserVaults } from "@/lib/supabase/queries/vaults";
import { getAllUserAnimeData } from "@/lib/supabase/queries/user-anime-data";
import { getInboxRecommendations } from "@/lib/supabase/queries/recommendations";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/headers/section-header";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { AnimeCarousel } from "@/components/anime/anime-carousel";
import { RecommendationsInbox } from "@/components/dashboard/recommendations-inbox";
import { VaultCard } from "@/components/vault/vault-card";
import { Button } from "@/components/ui/button";
import type { UserAnimeData } from "@/types/anime";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageContainer>
        <div className="px-4 pt-10 text-center">
          <div className="text-6xl mb-4">🎌</div>
          <h1
            className="text-3xl font-black text-[var(--text)]"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Welcome to AniVault
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm mx-auto">
            Browse anime freely. Sign in with Google when you want to add to vaults, rate, and share.
          </p>
          <Link href="/login" className="inline-block mt-6">
            <Button>Continue with Google</Button>
          </Link>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  const [vaults, allUserAnimeData, inboxRecs] = await Promise.all([
    getUserVaults(),
    getAllUserAnimeData(),
    getInboxRecommendations(),
  ]);

  // Compute stats
  const watchedCount = allUserAnimeData.filter((d: UserAnimeData) => d.status === "watched").length;
  const watchingCount = allUserAnimeData.filter((d: UserAnimeData) => d.status === "watching").length;
  const queuedCount = allUserAnimeData.filter((d: UserAnimeData) => d.status === "queued").length;
  const peakCount = allUserAnimeData.filter((d: UserAnimeData) => d.rating === 5).length;
  const newInVaultsCount = vaults.reduce((acc, v) => acc + (v.new_count ?? 0), 0);

  // Get anime currently watching
  const watchingIds = allUserAnimeData
    .filter((d: UserAnimeData) => d.status === "watching")
    .map(d => d.anime_id);
  
  let currentlyWatching: unknown[] = [];
  if (watchingIds.length > 0) {
    const { data } = await supabase
      .from("anime")
      .select("*")
      .in("id", watchingIds.slice(0, 10));
    currentlyWatching = data || [];
  }

  // Get recently added to vaults
  const allVaultIds = vaults.map(v => v.id);
  let newInVaults: unknown[] = [];
  if (allVaultIds.length > 0) {
    const { data } = await supabase
      .from("vault_anime")
      .select("anime (*)")
      .in("vault_id", allVaultIds)
      .order("added_at", { ascending: false })
      .limit(10);
    newInVaults = (data || []).map((d) => d.anime).filter(Boolean);
  }

  const greeting = getGreeting(profile?.name);
  const unreadCount = inboxRecs.length;

  return (
    <PageContainer>
      {/* Greeting */}
      <div className="px-4 pt-4 pb-2">
        <h1
          className="text-2xl font-black text-[var(--text)]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {greeting}
          <span className="ml-2">{profile?.avatar_url ? "🟢" : "👤"}</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {watchingCount > 0 ? `You're watching ${watchingCount} shows` : "What will you watch today?"}
        </p>
      </div>

      {/* Stats strip */}
      <div className="mt-3">
        <StatsStrip
          watchedCount={watchedCount}
          watchingCount={watchingCount}
          queuedCount={queuedCount}
          peakCount={peakCount}
          newInVaultsCount={newInVaultsCount}
        />
      </div>

      {/* Recommendations Inbox */}
      {inboxRecs.length > 0 && (
        <div className="mt-6">
          <SectionHeader title="Crew Recs 🔥" subtitle="Tap to view" />
          <RecommendationsInbox recommendations={inboxRecs as unknown as Parameters<typeof RecommendationsInbox>[0]["recommendations"]} />
        </div>
      )}

      {/* Currently Watching */}
      {currentlyWatching.length > 0 && (
        <div className="mt-6">
          <SectionHeader title="Currently Watching" viewAllLink="/vaults" />
          <AnimeCarousel animes={currentlyWatching as never} />
        </div>
      )}

      {/* New in Vaults */}
      {newInVaults.length > 0 && (
        <div className="mt-6">
          <SectionHeader title="New in Vaults" viewAllLink="/vaults" />
          <AnimeCarousel animes={newInVaults as never} />
        </div>
      )}

      {/* Your Vaults */}
      {vaults.length > 0 && (
        <div className="mt-6">
          <SectionHeader title="Your Vaults" viewAllLink="/vaults" />
          <div className="px-4 space-y-3">
            {vaults.slice(0, 3).map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        </div>
      )}

      <BottomNav unreadCount={unreadCount} />
    </PageContainer>
  );
}

function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const firstName = name?.split(" ")[0] || "there";
  if (hour < 12) return `Morning, ${firstName}`;
  if (hour < 17) return `Hey, ${firstName}`;
  if (hour < 21) return `Evening, ${firstName}`;
  return `Night owl, ${firstName}`;
}
