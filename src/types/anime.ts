export type AnimeStatus = "watched" | "watching" | "queued" | "dropped";

export interface Anime {
  id: string;
  mal_id: number | null;
  title: string;
  title_english: string | null;
  cover_image: string | null;
  synopsis: string | null;
  year: number | null;
  genres: string[] | null;
  studio: string | null;
  episode_count: number | null;
  mal_score: number | null;
  airing_status: string | null;
  season: string | null;
  created_at: string;
  metadata_fetched_at: string | null;
}

export interface UserAnimeData {
  user_id: string;
  anime_id: string;
  status: AnimeStatus | null;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  vibes: string[] | null;
  hot_take: string | null;
  updated_at: string;
}

export interface AnimeWatchSource {
  anime_id: string;
  url: string;
  source_name: string | null;
  added_by: string | null;
  added_at: string;
}

export interface AnimeCache {
  mal_id: number;
  data: Record<string, unknown>;
  fetched_at: string;
}

export interface UpcomingAnime {
  id: string;
  title: string;
  season: string | null;
  genres: string[] | null;
  studio: string | null;
  episode_count: number | null;
  current_ep: number | null;
  air_day: string | null;
  air_time_jst: string | null;
  next_air_date: string | null;
  synopsis: string | null;
  url: string | null;
  mal_id: number | null;
}

export const RATING_MAP: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "😴", label: "Skip" },
  2: { emoji: "😐", label: "Meh" },
  3: { emoji: "🙂", label: "Decent" },
  4: { emoji: "🔥", label: "Fire" },
  5: { emoji: "🤯", label: "PEAK" },
};

export const STATUS_MAP: Record<AnimeStatus, { label: string; icon: string; color: string }> = {
  watched: { label: "Watched", icon: "✅", color: "#22C55E" },
  watching: { label: "Watching", icon: "▶️", color: "#3B82F6" },
  queued: { label: "Queued", icon: "📋", color: "#F59E0B" },
  dropped: { label: "Dropped", icon: "💀", color: "#EF4444" },
};

export const VIBE_TAGS = [
  "PEAK", "CINEMA", "Heartwarming", "Hilarious", "Psychological",
  "Wholesome", "Depressing", "Mind-bending", "Chill", "Hype",
  "Underrated", "Toxic but good", "Therapist-required", "Comfort watch",
  "Peak Romance", "Gore", "Isekai done right", "Hidden gem",
  "Banger OP", "ABSOLUTE CINEMA",
];

export const GENRE_TAGS = [
  "Action", "Romance", "Comedy", "Isekai", "Psychological",
  "Slice of Life", "Fantasy", "Sci-Fi", "Horror", "Sports",
  "Mystery", "Drama", "Thriller", "Mecha", "Supernatural",
  "Historical", "Music", "Donghua",
];
