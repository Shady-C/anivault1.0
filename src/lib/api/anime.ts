import { animeClient, seasonsClient, schedulesClient } from "@/lib/api/jikan";
import { retryWithBackoff } from "@/lib/api/retry";
import type { Pagination } from "@rushelasli/jikants";

export interface AnimeSearchResult {
  data: unknown[];
  total: number;
  hasNextPage: boolean;
  error?: string;
}

export interface SeasonResult {
  data: unknown[];
  totalPages: number;
  totalItems: number;
  error?: string;
}

export async function searchAnime(
  query: string,
  page = 1,
  limit = 20,
  sfw = true
): Promise<AnimeSearchResult> {
  if (!query?.trim()) return { data: [], total: 0, hasNextPage: false };

  try {
    const response = await retryWithBackoff(() =>
      animeClient.searchAnime({ q: query.trim(), page, limit, sfw } as never)
    );
    return {
      data: (response as { data?: unknown[] }).data || [],
      total: (response as { pagination?: { items?: { total?: number } } }).pagination?.items?.total || 0,
      hasNextPage: (response as { pagination?: { has_next_page?: boolean } }).pagination?.has_next_page || false,
    };
  } catch (error) {
    return {
      data: [],
      total: 0,
      hasNextPage: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDetailAnime(malId: number) {
  try {
    const response = await retryWithBackoff(() => animeClient.getAnimeFullById(malId));
    return { data: (response as { data?: unknown }).data ?? null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getAnimeCharacters(malId: number) {
  try {
    const response = await retryWithBackoff(() => animeClient.getAnimeCharacters(malId));
    return { data: (response as { data?: unknown[] }).data || [], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getEpisodeAnime(malId: number) {
  try {
    const response = await retryWithBackoff(() => animeClient.getAnimeEpisodes(malId, 1));
    return { data: (response as { data?: unknown[] }).data || [], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getSeasonNow(page = 1, limit = 100): Promise<SeasonResult> {
  try {
    const response = await retryWithBackoff(() =>
      seasonsClient.getSeasonNow({ page, limit, sfw: true } as never)
    );
    const pagination = (response as { pagination?: Pagination }).pagination;
    return {
      data: (response as { data?: unknown[] }).data || [],
      totalPages: pagination?.last_visible_page ?? 1,
      totalItems: pagination?.items?.total ?? 0,
    };
  } catch (error) {
    return {
      data: [],
      totalPages: 0,
      totalItems: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSchedules(
  page = 1,
  options: { filter?: string; sfw?: boolean; limit?: number } = {}
): Promise<SeasonResult> {
  try {
    const params: Record<string, unknown> = {
      page,
      limit: options.limit || 25,
      sfw: options.sfw ?? true,
    };
    if (options.filter) params.filter = options.filter;

    const response = await retryWithBackoff(() => schedulesClient.getSchedules(params as never));
    const pagination = (response as { pagination?: Pagination }).pagination;
    return {
      data: (response as { data?: unknown[] }).data || [],
      totalPages: pagination?.last_visible_page ?? 1,
      totalItems: pagination?.items?.total ?? 0,
    };
  } catch (error) {
    return {
      data: [],
      totalPages: 0,
      totalItems: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getUserAnimeList(username: string) {
  try {
    const url = `https://api.jikan.moe/v4/users/${encodeURIComponent(username)}/animelist?status=completed&limit=300`;
    const response = await retryWithBackoff(() => fetch(url).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }));
    return { data: (response as { data?: unknown[] }).data || [], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function adaptJikanAnimeToDb(jikanAnime: Record<string, unknown>) {
  const genres = ((jikanAnime.genres as Array<{ name: string }>) || []).map((g) => g.name);
  const studio = ((jikanAnime.studios as Array<{ name: string }>) || [])[0]?.name ?? null;

  return {
    mal_id: jikanAnime.mal_id as number,
    title: (jikanAnime.title as string) || "Unknown",
    title_english: (jikanAnime.title_english as string | null) ?? null,
    cover_image:
      ((jikanAnime.images as Record<string, { large_image_url?: string; image_url?: string }> | null)
        ?.jpg?.large_image_url ??
        (jikanAnime.images as Record<string, { image_url?: string }> | null)?.jpg?.image_url) ??
      null,
    synopsis: (jikanAnime.synopsis as string | null) ?? null,
    year: (jikanAnime.year as number | null) ?? null,
    genres,
    studio,
    episode_count: (jikanAnime.episodes as number | null) ?? null,
    mal_score: (jikanAnime.score as number | null) ?? null,
    airing_status: (jikanAnime.status as string | null) ?? null,
    season: jikanAnime.season
      ? `${(jikanAnime.season as string).charAt(0).toUpperCase() + (jikanAnime.season as string).slice(1)} ${jikanAnime.year ?? ""}`
      : null,
  };
}
