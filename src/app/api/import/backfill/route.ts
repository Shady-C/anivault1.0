import { createClient } from "@/lib/supabase/server";
import { getAnimeCharacters, getEpisodeAnime } from "@/lib/api/anime";
import { cacheJikanAnime } from "@/lib/supabase/queries/anime";
import { RateLimiter } from "@/lib/pipeline/rate-limiter";
import type { JikanBlob } from "@/lib/pipeline/types";

export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { malIds } = await request.json();
  if (!Array.isArray(malIds) || malIds.some((id) => typeof id !== "number")) {
    return Response.json(
      { error: "malIds must be an array of numbers" },
      { status: 400 }
    );
  }

  const limiter = new RateLimiter(400);
  let updated = 0;

  for (const malId of malIds) {
    // Read current cache entry to get the existing detail blob
    const { data: cached } = await supabase
      .from("anime_cache")
      .select("data")
      .eq("mal_id", malId)
      .single();

    if (!cached?.data) continue;

    const existing = cached.data as JikanBlob;

    // Skip if already has characters/episodes populated
    if (
      Array.isArray(existing.characters) &&
      existing.characters.length > 0
    ) {
      continue;
    }

    const characters = await limiter.enqueue(() => getAnimeCharacters(malId));
    const episodes = await limiter.enqueue(() => getEpisodeAnime(malId));

    const fullBlob: JikanBlob = {
      detail: existing.detail,
      characters: (characters.data as Record<string, unknown>[]) || [],
      episodes: (episodes.data as Record<string, unknown>[]) || [],
    };

    await cacheJikanAnime(malId, fullBlob);
    updated++;
  }

  return Response.json({ updated });
}
