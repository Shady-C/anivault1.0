import { createClient } from "@/lib/supabase/server";
import {
  getDetailAnime,
  getAnimeCharacters,
  getEpisodeAnime,
} from "@/lib/api/anime";
import type { JikanBlob } from "@/lib/pipeline/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { malId } = await request.json();
  if (typeof malId !== "number") {
    return Response.json({ error: "malId must be a number" }, { status: 400 });
  }

  const [detail, characters, episodes] = await Promise.all([
    getDetailAnime(malId),
    getAnimeCharacters(malId),
    getEpisodeAnime(malId),
  ]);

  if (detail.error) {
    return Response.json(
      { error: `Failed to fetch anime ${malId}: ${detail.error}` },
      { status: 502 }
    );
  }

  const blob: JikanBlob = {
    detail: (detail.data as Record<string, unknown>) || {},
    characters: (characters.data as Record<string, unknown>[]) || [],
    episodes: (episodes.data as Record<string, unknown>[]) || [],
  };

  return Response.json(blob);
}
