import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDetailAnime, getAnimeCharacters, getEpisodeAnime, adaptJikanAnimeToDb } from "@/lib/api/anime";
import { upsertAnime, getAnimeByMalId, cacheJikanAnime, getCachedAnime } from "@/lib/supabase/queries/anime";
import { getWatchSources } from "@/lib/supabase/queries/watch-sources";
import { getUserVaults, getAnimeVaultStatus } from "@/lib/supabase/queries/vaults";
import { getUserAnimeData } from "@/lib/supabase/queries/user-anime-data";
import { AnimeDetailClient } from "./anime-detail-client";

export default async function AnimeDetailPage({ params }: { params: Promise<{ malId: string }> }) {
  const { malId } = await params;
  const malIdNum = parseInt(malId);
  if (isNaN(malIdNum)) redirect("/search");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try to get from local DB first
  let anime = await getAnimeByMalId(malIdNum);

  // Check Jikan cache — bundle format: { detail, characters, episodes }
  // Old entries may be raw detail objects; detect by presence of 'detail' key.
  let jikanData: Record<string, unknown> | null = null;
  let cachedCharacters: unknown[] | null = null;
  let cachedEpisodes: unknown[] | null = null;

  const cached = await getCachedAnime(malIdNum);
  if (cached) {
    const cacheData = cached.data as Record<string, unknown>;
    if ("detail" in cacheData) {
      jikanData = cacheData.detail as Record<string, unknown>;
      cachedCharacters = (cacheData.characters as unknown[]) ?? null;
      cachedEpisodes = (cacheData.episodes as unknown[]) ?? null;
    } else {
      jikanData = cacheData;
    }
  } else {
    const { data } = await getDetailAnime(malIdNum);
    if (data) {
      jikanData = data as Record<string, unknown>;
      // Fetch sequentially to avoid burst rate-limiting
      const { data: chars } = await getAnimeCharacters(malIdNum);
      await new Promise((r) => setTimeout(r, 400));
      const { data: eps } = await getEpisodeAnime(malIdNum);
      cachedCharacters = chars;
      cachedEpisodes = eps;
      await cacheJikanAnime(malIdNum, { detail: jikanData, characters: chars, episodes: eps });
    }
  }

  // Upsert anime to DB
  if (jikanData && !anime) {
    const dbData = adaptJikanAnimeToDb(jikanData as Record<string, unknown>);
    anime = await upsertAnime(dbData);
  }

  // Load supporting data — Jikan calls skipped on cache hits
  const [
    watchSources,
    vaults,
    userAnimeData,
    vaultStatus,
    characters,
    episodes,
  ] = await Promise.all([
    anime ? getWatchSources(anime.id) : Promise.resolve([]),
    getUserVaults(),
    anime ? getUserAnimeData(anime.id) : Promise.resolve(null),
    anime ? getAnimeVaultStatus(anime.id) : Promise.resolve([]),
    cachedCharacters !== null
      ? Promise.resolve({ data: cachedCharacters, error: null })
      : getAnimeCharacters(malIdNum),
    cachedEpisodes !== null
      ? Promise.resolve({ data: cachedEpisodes, error: null })
      : getEpisodeAnime(malIdNum),
  ]);

  // Build hero data
  const heroData = jikanData ? {
    imageUrl: anime?.cover_image || ((jikanData.images as Record<string, Record<string, string>> | null)?.jpg?.large_image_url ?? null),
    title: anime?.title || (jikanData.title as string) || "Unknown",
    titleEnglish: anime?.title_english || (jikanData.title_english as string | null) || null,
    titleJapanese: (jikanData.title_japanese as string | null) ?? null,
    titleSynonyms: (jikanData.title_synonyms as string[]) || [],
    type: (jikanData.type as string | null) ?? null,
    status: anime?.airing_status || (jikanData.status as string | null) || null,
    score: anime?.mal_score || (jikanData.score as number | null) || null,
    scoredBy: (jikanData.scored_by as number | null) ?? null,
    rank: (jikanData.rank as number | null) ?? null,
    popularity: (jikanData.popularity as number | null) ?? null,
    members: (jikanData.members as number | null) ?? null,
    season: (jikanData.season as string | null) ?? null,
    year: anime?.year || (jikanData.year as number | null) || null,
    studios: ((jikanData.studios as Array<{ mal_id: number; name: string }>) || []).map(s => ({ mal_id: s.mal_id, name: s.name })),
    schedules: (jikanData.broadcast as Record<string, string | null> | null)?.day ?? null,
    genres: anime?.genres || ((jikanData.genres as Array<{ name: string }>) || []).map(g => g.name),
    userRating: userAnimeData?.rating ?? null,
    userStatus: userAnimeData?.status ?? null,
    vaultCount: vaultStatus.length,
    vaultName: vaultStatus[0]?.vaultName ?? null,
  } : null;

  const sidebarData = jikanData ? {
    titleJapanese: (jikanData.title_japanese as string | null) ?? null,
    titleSynonyms: (jikanData.title_synonyms as string[]) || [],
    status: anime?.airing_status || (jikanData.status as string | null) || null,
    episodes: anime?.episode_count || (jikanData.episodes as number | null) || null,
    rating: (jikanData.rating as string | null) ?? null,
    season: (jikanData.season as string | null) ?? null,
    year: anime?.year || (jikanData.year as number | null) || null,
    aired: (jikanData.aired as Record<string, string | null> | null),
    duration: (jikanData.duration as string | null) ?? null,
    broadcast: (jikanData.broadcast as Record<string, string | null> | null),
    studios: ((jikanData.studios as Array<{ mal_id: number; name: string }>) || []),
    producers: ((jikanData.producers as Array<{ mal_id: number; name: string }>) || []),
    licensors: ((jikanData.licensors as Array<{ mal_id: number; name: string }>) || []),
    source: (jikanData.source as string | null) ?? null,
    genres: ((jikanData.genres as Array<{ mal_id: number; name: string }>) || []),
    themes: ((jikanData.themes as Array<{ mal_id: number; name: string }>) || []),
    demographics: ((jikanData.demographics as Array<{ mal_id: number; name: string }>) || []),
    rank: (jikanData.rank as number | null) ?? null,
    popularity: (jikanData.popularity as number | null) ?? null,
    members: (jikanData.members as number | null) ?? null,
    favorites: (jikanData.favorites as number | null) ?? null,
  } : null;

  const trailersData = jikanData ? {
    embed_url: (jikanData.trailer as Record<string, string | null> | null)?.embed_url ?? null,
    youtube_id: (jikanData.trailer as Record<string, string | null> | null)?.youtube_id ?? null,
  } : null;

  const themesData = jikanData ? {
    openings: (jikanData.theme as Record<string, string[]> | null)?.openings || [],
    endings: (jikanData.theme as Record<string, string[]> | null)?.endings || [],
  } : null;

  return (
    <AnimeDetailClient
      anime={anime}
      heroData={heroData}
      sidebarData={sidebarData}
      trailersData={trailersData}
      themesData={themesData}
      charactersData={characters.data as never}
      episodesData={episodes.data as never}
      relationsData={((jikanData?.relations || []) as never)}
      watchSources={watchSources}
      vaults={vaults}
      checkedVaultIds={vaultStatus.map(v => v.vaultId)}
      userAnimeData={userAnimeData}
      currentUserId={user?.id}
    />
  );
}
