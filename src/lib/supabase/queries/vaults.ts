"use server";

import { createClient } from "@/lib/supabase/server";
import type { Vault, VaultWithMembers, VaultDetail, VaultType } from "@/types/vault";

export async function getUserVaults(): Promise<VaultWithMembers[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("vault_members")
    .select(`
      vault_id,
      joined_at,
      vaults (
        id, name, emoji, type, description, created_at
      )
    `)
    .eq("user_id", user.id);

  if (error || !data) return [];

  const vaultIds = data.map((d) => d.vault_id);

  const { data: membersData } = await supabase
    .from("vault_members")
    .select("vault_id, user_id, joined_at, users (id, name, avatar_url)")
    .in("vault_id", vaultIds);

  const { data: animeCounts } = await supabase
    .from("vault_anime")
    .select("vault_id")
    .in("vault_id", vaultIds);

  const { data: recentAdds } = await supabase
    .from("vault_anime")
    .select("vault_id, added_at")
    .in("vault_id", vaultIds)
    .gte("added_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  return data.map((d) => {
    const vault = d.vaults as unknown as Vault;
    const members = (membersData || [])
      .filter((m) => m.vault_id === d.vault_id)
      .map((m) => ({ vault_id: m.vault_id, user_id: m.user_id, joined_at: m.joined_at, user: m.users as never }));
    const anime_count = (animeCounts || []).filter((a) => a.vault_id === d.vault_id).length;
    const new_count = (recentAdds || []).filter((a) => a.vault_id === d.vault_id).length;

    return { ...vault, members, anime_count, new_count };
  });
}

export async function getVaultDetail(vaultId: string): Promise<VaultDetail | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vault, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("id", vaultId)
    .single();

  if (error || !vault) return null;

  const { data: members } = await supabase
    .from("vault_members")
    .select("vault_id, user_id, joined_at, users (id, name, avatar_url)")
    .eq("vault_id", vaultId);

  const { data: vaultAnime } = await supabase
    .from("vault_anime")
    .select(`
      vault_id, anime_id, added_by, added_at,
      anime (*)
    `)
    .eq("vault_id", vaultId)
    .order("added_at", { ascending: false });

  const animeIds = (vaultAnime || []).map((va) => va.anime_id);
  let userAnimeDataMap: Record<string, unknown> = {};
  if (animeIds.length > 0) {
    const { data: uad } = await supabase
      .from("user_anime_data")
      .select("*")
      .eq("user_id", user.id)
      .in("anime_id", animeIds);
    userAnimeDataMap = Object.fromEntries((uad || []).map((d) => [d.anime_id, d]));
  }

  return {
    ...vault,
    members: (members || []).map((m) => ({ vault_id: m.vault_id, user_id: m.user_id, joined_at: m.joined_at, user: m.users as never })),
    anime: (vaultAnime || []).map((va) => ({
      vault_id: va.vault_id,
      anime_id: va.anime_id,
      added_by: va.added_by,
      added_at: va.added_at,
      anime: va.anime as never,
      user_anime_data: (userAnimeDataMap[va.anime_id] as never) ?? null,
    })),
  } as VaultDetail;
}

export async function createVault(
  name: string,
  emoji: string,
  type: VaultType
): Promise<Vault | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    console.error("[createVault] no user, auth error:", authError);
    return null;
  }

  const { data, error } = await supabase.rpc("create_vault_for_user", {
    p_name: name,
    p_emoji: emoji,
    p_type: type,
  });

  if (error || !data?.[0]) {
    console.error("[createVault] rpc error:", error);
    return null;
  }

  return data[0] as Vault;
}

export async function leaveVault(vaultId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("vault_members")
    .delete()
    .eq("vault_id", vaultId)
    .eq("user_id", user.id);

  const { data: remaining } = await supabase
    .from("vault_members")
    .select("user_id")
    .eq("vault_id", vaultId);

  if (!remaining || remaining.length === 0) {
    await supabase.from("vault_anime").delete().eq("vault_id", vaultId);
    await supabase.from("vaults").delete().eq("id", vaultId);
  }
}

export async function getAnimeVaultStatus(
  animeId: string
): Promise<{ vaultId: string; vaultName: string }[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("vault_anime")
    .select("vault_id, vaults (name)")
    .eq("anime_id", animeId);

  return (data || []).map((d) => ({
    vaultId: d.vault_id,
    vaultName: (d.vaults as unknown as { name: string } | null)?.name ?? "Vault",
  }));
}

export async function toggleAnimeInVault(
  vaultId: string,
  animeId: string,
  add: boolean
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (add) {
    await supabase.from("vault_anime").upsert(
      { vault_id: vaultId, anime_id: animeId, added_by: user.id, added_at: new Date().toISOString() },
      { onConflict: "vault_id,anime_id" }
    );
  } else {
    await supabase.from("vault_anime").delete().eq("vault_id", vaultId).eq("anime_id", animeId);
  }
}
