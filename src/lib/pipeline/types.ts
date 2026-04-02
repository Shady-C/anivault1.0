// Shared contracts between pipeline stages.
// Parse → Fetch → Ingest → DB Write

export interface ParsedEntry {
  title: string;
  mal_id: number | null;
  status: "watched" | "watching" | "queued" | "dropped" | null;
  rating: number | null; // 1–5 if detectable
  notes: string | null;
  confidence: "parsed" | "inferred";
}

export interface JikanResult {
  malId: number;
  title: string;
  titleEnglish: string | null;
  year: number | null;
  score: number | null;
  episodes: number | null;
  synopsis: string | null;
  coverImage: string | null;
  airingStatus: string;
  type: string;
}

export interface JikanBlob {
  detail: Record<string, unknown>;
  characters: Record<string, unknown>[];
  episodes: Record<string, unknown>[];
}

export interface FetchedEntry {
  parsed: ParsedEntry;
  mal_id: number;
  jikan_blob: JikanBlob;
  search_confidence: "high" | "medium" | "low" | "none";
}

export interface IngestPayload {
  entries: FetchedEntry[];
  vault_id: string;
}

export interface IngestResult {
  inserted: number;
  updated: number;
  skipped: number;
  vault_anime_created: number;
  user_anime_data_created: number;
}

// Search result shape used by the review UI (mirrors resolver's format)
export interface SearchResultEntry {
  query: string;
  results: JikanResult[];
  topMatch: JikanResult | null;
  confidence: "high" | "medium" | "low" | "none";
  status:
    | "searching"
    | "pending"
    | "approved"
    | "rejected"
    | "failed"
    | "no-results";
  approvedMatch: JikanResult | null;
  fetchedBlob?: JikanBlob | null;
  error?: string;
}
