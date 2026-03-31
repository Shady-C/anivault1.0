"use server";

import { createClient } from "@/lib/supabase/server";
import type { UpcomingAnime } from "@/types/anime";

export async function getFollowedShows(): Promise<UpcomingAnime[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_follows")
    .select("upcoming_anime (*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []).map((d) => d.upcoming_anime).filter(Boolean) as unknown as UpcomingAnime[];
}

export async function toggleFollow(upcomingAnimeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from("user_follows")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("upcoming_anime_id", upcomingAnimeId)
    .single();

  if (existing) {
    await supabase
      .from("user_follows")
      .delete()
      .eq("user_id", user.id)
      .eq("upcoming_anime_id", upcomingAnimeId);
    return false;
  } else {
    await supabase
      .from("user_follows")
      .insert({ user_id: user.id, upcoming_anime_id: upcomingAnimeId });
    return true;
  }
}

export async function isFollowing(upcomingAnimeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_follows")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("upcoming_anime_id", upcomingAnimeId)
    .single();

  return !!data;
}
