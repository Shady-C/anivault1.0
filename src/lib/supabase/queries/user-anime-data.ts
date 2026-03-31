"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserAnimeData, AnimeStatus } from "@/types/anime";
import type { User } from "@/types/user";

export async function getUserAnimeData(animeId: string): Promise<UserAnimeData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_anime_data")
    .select("*")
    .eq("user_id", user.id)
    .eq("anime_id", animeId)
    .single();

  if (error) return null;
  return data as UserAnimeData;
}

export async function setUserAnimeData(
  animeId: string,
  updates: {
    status?: AnimeStatus | null;
    rating?: 1 | 2 | 3 | 4 | 5 | null;
    vibes?: string[] | null;
    hot_take?: string | null;
  }
): Promise<UserAnimeData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_anime_data")
    .upsert(
      { user_id: user.id, anime_id: animeId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: "user_id,anime_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("setUserAnimeData error:", error);
    return null;
  }
  return data as UserAnimeData;
}

export async function getCrewTakes(
  animeId: string,
  vaultId: string
): Promise<Array<{ user: User; review: UserAnimeData }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: members } = await supabase
    .from("vault_members")
    .select("user_id")
    .eq("vault_id", vaultId)
    .neq("user_id", user.id);

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m) => m.user_id);

  const { data: reviews } = await supabase
    .from("user_anime_data")
    .select("*, users (id, name, avatar_url)")
    .eq("anime_id", animeId)
    .in("user_id", memberIds);

  if (!reviews) return [];

  return reviews
    .filter((r) => r.users)
    .map((r) => ({
      user: r.users as unknown as User,
      review: {
        user_id: r.user_id,
        anime_id: r.anime_id,
        status: r.status,
        rating: r.rating,
        vibes: r.vibes,
        hot_take: r.hot_take,
        updated_at: r.updated_at,
      } as UserAnimeData,
    }));
}

export async function getAllUserAnimeData(): Promise<UserAnimeData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_anime_data")
    .select("*")
    .eq("user_id", user.id);

  if (error) return [];
  return (data || []) as UserAnimeData[];
}
