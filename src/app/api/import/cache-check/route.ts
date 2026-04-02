import { createClient } from "@/lib/supabase/server";
import type { JikanBlob } from "@/lib/pipeline/types";

const TTL = 24 * 60 * 60 * 1000; // 24 hours

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

  const { data, error } = await supabase
    .from("anime_cache")
    .select("mal_id, data, fetched_at")
    .in("mal_id", malIds);

  if (error || !data) {
    return Response.json({});
  }

  const now = Date.now();
  const results: Record<string, JikanBlob> = {};

  for (const row of data) {
    const fetchedAt = new Date(row.fetched_at).getTime();
    if (now - fetchedAt > TTL) continue;
    results[String(row.mal_id)] = row.data as JikanBlob;
  }

  return Response.json(results);
}
