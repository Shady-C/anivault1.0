"use server";

import { createClient } from "@/lib/supabase/server";
import type { AnimeWatchSource } from "@/types/anime";

function detectSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("crunchyroll")) return "Crunchyroll";
    if (hostname.includes("netflix")) return "Netflix";
    if (hostname.includes("hianime") || hostname.includes("aniwatch")) return "HiAnime";
    if (hostname.includes("funimation")) return "Funimation";
    if (hostname.includes("hidive")) return "HIDIVE";
    if (hostname.includes("amazon") || hostname.includes("primevideo")) return "Prime Video";
    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("bilibili")) return "Bilibili";
    if (hostname.includes("gogoanime") || hostname.includes("gogoanimehd")) return "Gogoanime";
    const parts = hostname.replace("www.", "").split(".");
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return "Unknown";
  }
}

export async function getWatchSources(animeId: string): Promise<AnimeWatchSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anime_watch_sources")
    .select("*")
    .eq("anime_id", animeId)
    .order("added_at", { ascending: true });

  if (error) return [];
  return (data || []) as AnimeWatchSource[];
}

export async function addWatchSource(animeId: string, url: string): Promise<AnimeWatchSource | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const source_name = detectSourceName(url);

  const { data, error } = await supabase
    .from("anime_watch_sources")
    .upsert(
      { anime_id: animeId, url, source_name, added_by: user.id, added_at: new Date().toISOString() },
      { onConflict: "anime_id,url" }
    )
    .select()
    .single();

  if (error) {
    console.error("addWatchSource error:", error);
    return null;
  }
  return data as AnimeWatchSource;
}
