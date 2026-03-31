"use server";

import { createClient } from "@/lib/supabase/server";
import type { Recommendation } from "@/types/api";

export async function sendRecommendation(
  toUserId: string,
  animeId: string,
  vaultId?: string,
  message?: string
): Promise<Recommendation | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("recommendations")
    .insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      anime_id: animeId,
      vault_id: vaultId ?? null,
      message: message ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("sendRecommendation error:", error);
    return null;
  }

  await supabase.from("notifications").insert({
    user_id: toUserId,
    type: "recommendation",
    title: `Someone recommended an anime to you`,
    body: message ?? null,
    data: { recommendation_id: data.id, anime_id: animeId },
  });

  return data as Recommendation;
}

export async function getInboxRecommendations(): Promise<
  Array<Recommendation & { anime: unknown; from_user: unknown }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("recommendations")
    .select(`
      *,
      anime (id, mal_id, title, cover_image, genres),
      from_user:from_user_id (id, name, avatar_url)
    `)
    .eq("to_user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as unknown as Array<Recommendation & { anime: unknown; from_user: unknown }>;
}

export async function updateRecommendationStatus(
  recId: string,
  status: "accepted" | "dismissed"
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("recommendations")
    .update({ status, seen_at: new Date().toISOString() })
    .eq("id", recId);
}
