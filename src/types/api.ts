export type RecStatus = "pending" | "accepted" | "dismissed";

export interface Recommendation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  anime_id: string;
  vault_id: string | null;
  message: string | null;
  created_at: string;
  seen_at: string | null;
  status: RecStatus;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasNextPage: boolean;
  error: string | null;
}

export interface JikanAnimeBasic {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
    webp: { image_url: string; large_image_url: string };
  };
  synopsis: string | null;
  year: number | null;
  genres: Array<{ mal_id: number; name: string }>;
  studios: Array<{ mal_id: number; name: string }>;
  episodes: number | null;
  score: number | null;
  status: string;
  season: string | null;
  aired: { from: string | null; to: string | null };
  broadcast: { day: string | null; time: string | null; timezone: string | null };
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  trailer: { youtube_id: string | null; url: string | null; embed_url: string | null };
  type: string | null;
  rating: string | null;
  source: string | null;
  duration: string | null;
  themes: Array<{ mal_id: number; name: string }>;
  demographics: Array<{ mal_id: number; name: string }>;
  producers: Array<{ mal_id: number; name: string }>;
  licensors: Array<{ mal_id: number; name: string }>;
  title_synonyms: string[];
  title_japanese: string | null;
}

export interface JikanSearchResponse {
  data: JikanAnimeBasic[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    items: { count: number; total: number; per_page: number };
  };
}
