import type { ParsedEntry } from "./types";

const VIBE_KEYWORDS: Record<string, string> = {
  peak: "PEAK",
  cinema: "CINEMA",
  "absolute cinema": "ABSOLUTE CINEMA",
  heartwarming: "Heartwarming",
  hilarious: "Hilarious",
  psychological: "Psychological",
  wholesome: "Wholesome",
  depressing: "Depressing",
  "mind-bending": "Mind-bending",
  chill: "Chill",
  hype: "Hype",
  underrated: "Underrated",
  "comfort watch": "Comfort watch",
  "peak romance": "Peak Romance",
  "isekai done right": "Isekai done right",
  "hidden gem": "Hidden gem",
  "well written": "CINEMA",
  "no plot holes": "CINEMA",
};

export function extractRatingFromNotes(notes: string | null): number | null {
  if (!notes) return null;
  const match = notes.match(/(\d+)\s*\/\s*10/);
  if (!match) return null;
  const outOf10 = parseInt(match[1], 10);
  return Math.min(5, Math.max(1, Math.round(outOf10 / 2)));
}

export function extractVibesFromNotes(notes: string | null): string[] {
  if (!notes) return [];
  const lower = notes.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, vibe] of Object.entries(VIBE_KEYWORDS)) {
    if (lower.includes(keyword)) found.add(vibe);
  }
  return Array.from(found);
}

export function resolveRating(entry: ParsedEntry): number | null {
  if (entry.rating !== null) return entry.rating;
  return extractRatingFromNotes(entry.notes);
}
