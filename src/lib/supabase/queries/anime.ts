"use server";

import { createClient } from "@/lib/supabase/server";
import type { Anime } from "@/types/anime";

export async function upsertAnime(animeData: {
  mal_id: number;
  title: string;
  title_english?: string | null;
  cover_image?: string | null;
  synopsis?: string | null;
  year?: number | null;
  genres?: string[] | null;
  studio?: string | null;
  episode_count?: number | null;
  mal_score?: number | null;
  airing_status?: string | null;
  season?: string | null;
}): Promise<Anime | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("anime")
    .upsert(animeData, { onConflict: "mal_id" })
    .select()
    .single();

  if (error) {
    console.error("upsertAnime error:", error);
    return null;
  }
  return data as Anime;
}

export async function getAnimeByMalId(malId: number): Promise<Anime | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("mal_id", malId)
    .single();

  if (error) return null;
  return data as Anime;
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Anime;
}

export async function enrichAnime(
  id: string,
  jikanData: {
    title_english?: string | null;
    cover_image?: string | null;
    synopsis?: string | null;
    episode_count?: number | null;
    mal_score?: number | null;
    studio?: string | null;
    airing_status?: string | null;
    season?: string | null;
    genres?: string[] | null;
  }
): Promise<Anime | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime")
    .update({ ...jikanData, metadata_fetched_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("enrichAnime error:", error);
    return null;
  }
  return data as Anime;
}

export async function searchLocalAnime(query: string, limit = 10): Promise<Anime[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .ilike("title", `%${query}%`)
    .limit(limit);

  if (error) return [];
  return (data || []) as Anime[];
}

export async function cacheJikanAnime(malId: number, data: unknown): Promise<void> {
  const supabase = await createClient();
  await supabase.from("anime_cache").upsert(
    { mal_id: malId, data, fetched_at: new Date().toISOString() },
    { onConflict: "mal_id" }
  );
}

export async function getCachedAnime(malId: number): Promise<{ data: unknown; fetched_at: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime_cache")
    .select("data, fetched_at")
    .eq("mal_id", malId)
    .single();

  if (error || !data) return null;

  const fetchedAt = new Date(data.fetched_at).getTime();
  const now = Date.now();
  const TTL = 24 * 60 * 60 * 1000;
  if (now - fetchedAt > TTL) return null;

  return data as { data: unknown; fetched_at: string };
}
