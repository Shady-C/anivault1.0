import { createClient } from "@/lib/supabase/server";
import { adaptJikanAnimeToDb } from "@/lib/api/anime";
import { resolveRating, extractVibesFromNotes } from "@/lib/pipeline/notes-mapper";
import type { IngestPayload, IngestResult, FetchedEntry } from "@/lib/pipeline/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: IngestPayload = await request.json();

  // Validate vault membership
  const { data: membership } = await supabase
    .from("vault_members")
    .select("vault_id")
    .eq("vault_id", payload.vault_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return Response.json({ error: "Not a vault member" }, { status: 403 });
  }

  if (!payload.entries || payload.entries.length === 0) {
    const emptyResult: IngestResult = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      vault_anime_created: 0,
      user_anime_data_created: 0,
    };
    return Response.json(emptyResult);
  }

  try {
    const result = await ingestEntries(supabase, payload, user.id);
    return Response.json(result);
  } catch (error) {
    console.error("Ingest failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Ingest failed" },
      { status: 500 }
    );
  }
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function ingestEntries(
  supabase: SupabaseClient,
  payload: IngestPayload,
  userId: string
): Promise<IngestResult> {
  // Step 1: Normalize all blobs
  const validEntries: { entry: FetchedEntry; normalized: ReturnType<typeof adaptJikanAnimeToDb> }[] = [];

  for (const entry of payload.entries) {
    if (!entry.jikan_blob?.detail) continue;
    try {
      const normalized = adaptJikanAnimeToDb(
        entry.jikan_blob.detail as Record<string, unknown>
      );
      validEntries.push({ entry, normalized });
    } catch {
      // Skip malformed blobs
    }
  }

  const skippedFromBlob = payload.entries.length - validEntries.length;

  // Step 2: Upsert anime rows
  const normalizedArray = validEntries.map((v) => v.normalized);
  const { data: animeRows, error: animeError } = await supabase
    .from("anime")
    .upsert(normalizedArray, { onConflict: "mal_id" })
    .select("id, mal_id");

  if (animeError || !animeRows) {
    throw new Error(`anime upsert failed: ${animeError?.message}`);
  }

  const malIdToAnimeId = new Map<number, string>();
  for (const row of animeRows) {
    malIdToAnimeId.set(row.mal_id, row.id);
  }

  // Step 3: Write anime_cache rows
  const cacheRows = validEntries
    .filter((v) => malIdToAnimeId.has(v.entry.mal_id))
    .map((v) => ({
      mal_id: v.entry.mal_id,
      data: v.entry.jikan_blob,
      fetched_at: new Date().toISOString(),
    }));

  if (cacheRows.length > 0) {
    await supabase
      .from("anime_cache")
      .upsert(cacheRows, { onConflict: "mal_id" });
  }

  // Step 4: Upsert vault_anime rows
  const vaultAnimeRows = validEntries
    .filter((v) => malIdToAnimeId.has(v.entry.mal_id))
    .map((v) => ({
      vault_id: payload.vault_id,
      anime_id: malIdToAnimeId.get(v.entry.mal_id)!,
      added_by: userId,
      added_at: new Date().toISOString(),
    }));

  let vaultAnimeCreated = 0;
  let skippedDuplicates = 0;

  if (vaultAnimeRows.length > 0) {
    const { data: vaultAnimeResult } = await supabase
      .from("vault_anime")
      .upsert(vaultAnimeRows, {
        onConflict: "vault_id,anime_id",
        ignoreDuplicates: true,
      })
      .select();

    vaultAnimeCreated = vaultAnimeResult?.length ?? 0;
    skippedDuplicates = vaultAnimeRows.length - vaultAnimeCreated;
  }

  // Step 5: Upsert user_anime_data rows (only for entries with status)
  const userDataRows = validEntries
    .filter((v) => malIdToAnimeId.has(v.entry.mal_id))
    .filter((v) => v.entry.parsed.status !== null)
    .map((v) => ({
      user_id: userId,
      anime_id: malIdToAnimeId.get(v.entry.mal_id)!,
      status: v.entry.parsed.status,
      rating: resolveRating(v.entry.parsed),
      vibes: extractVibesFromNotes(v.entry.parsed.notes),
      hot_take: v.entry.parsed.notes ?? null,
      updated_at: new Date().toISOString(),
    }));

  let userAnimeDataCreated = 0;
  if (userDataRows.length > 0) {
    const { data: userDataResult } = await supabase
      .from("user_anime_data")
      .upsert(userDataRows, { onConflict: "user_id,anime_id" })
      .select();

    userAnimeDataCreated = userDataResult?.length ?? 0;
  }

  return {
    inserted: animeRows.length,
    updated: 0,
    skipped: skippedFromBlob + skippedDuplicates,
    vault_anime_created: vaultAnimeCreated,
    user_anime_data_created: userAnimeDataCreated,
  };
}
