import { createClient } from "@/lib/supabase/server";
import { getDetailAnime } from "@/lib/api/anime";
import { RateLimiter } from "@/lib/pipeline/rate-limiter";
import type { JikanBlob } from "@/lib/pipeline/types";

export const maxDuration = 120;

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

  if (malIds.length > 1000) {
    return Response.json(
      { error: "Maximum 1000 entries per request" },
      { status: 400 }
    );
  }

  // Detail-only fetch — characters/episodes are backfilled post-import
  const limiter = new RateLimiter(400);
  const results: Record<string, JikanBlob> = {};

  for (const malId of malIds) {
    const detail = await limiter.enqueue(() => getDetailAnime(malId));
    if (detail.error) continue;

    results[String(malId)] = {
      detail: (detail.data as Record<string, unknown>) || {},
      characters: [],
      episodes: [],
    };
  }

  return Response.json(results);
}
