import type { Anime, UserAnimeData } from "./anime";
import type { User } from "./user";

export type VaultType = "personal" | "shared";

export interface Vault {
  id: string;
  name: string;
  emoji: string;
  type: VaultType;
  description: string | null;
  created_at: string;
}

export interface VaultMember {
  vault_id: string;
  user_id: string;
  joined_at: string;
  user?: User;
}

export interface VaultAnime {
  vault_id: string;
  anime_id: string;
  added_by: string | null;
  added_at: string;
  anime?: Anime;
  user_anime_data?: UserAnimeData | null;
}

export interface VaultWithMembers extends Vault {
  members: VaultMember[];
  anime_count?: number;
  new_count?: number;
}

export interface VaultDetail extends VaultWithMembers {
  anime: VaultAnime[];
}

export interface VaultInvite {
  id: string;
  vault_id: string;
  created_by: string;
  token: string;
  expires_at: string;
  created_at: string;
}
