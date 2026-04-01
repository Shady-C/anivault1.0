import type { ParsedEntry } from "./types";

// --- Regex patterns ---

const LINKED_ENTRY_REGEX =
  /^\*?\s*\[([^\]]+)\]\(https:\/\/myanimelist\.net\/anime\/(\d+)\)([\s\S]*)$/;

const MAL_URL_ONLY_REGEX =
  /^https:\/\/myanimelist\.net\/anime\/(\d+)\/?$/;

const RATING_REGEX = /(\d{1,2})\s*\/\s*10/;

// --- Status keyword maps ---

const STATUS_KEYWORDS: Record<string, ParsedEntry["status"]> = {
  watched: "watched",
  completed: "watched",
  watching: "watching",
  "currently watching": "watching",
  queued: "queued",
  "plan to watch": "queued",
  ptw: "queued",
  dropped: "dropped",
  dnf: "dropped",
};

const SECTION_MAP: Record<string, ParsedEntry["status"]> = {
  watched: "watched",
  completed: "watched",
  watching: "watching",
  "currently watching": "watching",
  "plan to watch": "queued",
  queue: "queued",
  queued: "queued",
  ptw: "queued",
  dropped: "dropped",
  dnf: "dropped",
};

// --- Helpers ---

function parseSection(line: string): ParsedEntry["status"] | null {
  if (!line.startsWith("## ") && !line.startsWith("### ")) return null;
  const value = line.replace(/^#{2,3}\s*/, "").trim().toLowerCase();
  for (const [key, status] of Object.entries(SECTION_MAP)) {
    if (value.includes(key)) return status;
  }
  return null;
}

function splitTitleAndNote(content: string): {
  title: string;
  note: string | null;
} {
  const emDash = " \u2014 "; // —
  const enDash = " \u2013 "; // –
  const lastEmDash = content.lastIndexOf(emDash);

  if (lastEmDash !== -1) {
    return {
      title: content.slice(0, lastEmDash).trim(),
      note: content.slice(lastEmDash + emDash.length),
    };
  }

  const firstEnDash = content.indexOf(enDash);
  if (firstEnDash !== -1) {
    return {
      title: content.slice(0, firstEnDash).trim(),
      note: content.slice(firstEnDash + enDash.length),
    };
  }

  return { title: content.trim(), note: null };
}

function extractInlineStatus(
  text: string
): { status: ParsedEntry["status"]; cleaned: string } | null {
  const lower = text.toLowerCase();

  // Pattern: "watched: Title" or "watching: Title"
  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    const prefixPattern = new RegExp(`^${keyword}\\s*:\\s*`, "i");
    if (prefixPattern.test(text)) {
      return { status, cleaned: text.replace(prefixPattern, "").trim() };
    }
  }

  // Pattern: "Title (watched)" or "Title (completed)"
  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    const suffixPattern = new RegExp(`\\s*\\(${keyword}\\)\\s*$`, "i");
    if (suffixPattern.test(text)) {
      return { status, cleaned: text.replace(suffixPattern, "").trim() };
    }
  }

  // Pattern: keyword appears as standalone in the text (after dash/comma)
  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    const wordBoundary = new RegExp(`(?:^|,\\s*|\\s+)${keyword}(?:$|,|\\s)`, "i");
    if (wordBoundary.test(lower)) {
      const cleanRegex = new RegExp(`(?:,\\s*)?${keyword}(?:,\\s*)?`, "gi");
      return { status, cleaned: text.replace(cleanRegex, " ").trim() };
    }
  }

  return null;
}

function extractRating(text: string): { rating: number | null; cleaned: string } {
  const match = text.match(RATING_REGEX);
  if (!match) return { rating: null, cleaned: text };
  const outOf10 = parseInt(match[1], 10);
  if (outOf10 < 1 || outOf10 > 10) return { rating: null, cleaned: text };
  const rating = Math.min(5, Math.max(1, Math.round(outOf10 / 2)));
  const cleaned = text.replace(RATING_REGEX, "").replace(/,\s*,/g, ",").trim();
  return { rating, cleaned };
}

function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.length < 3) return true;
  if (/^#{1,6}\s/.test(trimmed)) return true; // heading only (section detection handled separately)
  if (/^https?:\/\/myanimelist\.net\/(?!anime\/\d)/.test(trimmed)) return true; // non-anime MAL URL
  return false;
}

// --- Stage A: Structured regex parser ---

export function parseStructured(rawText: string): {
  entries: ParsedEntry[];
  flagged: { line: string; sectionStatus: ParsedEntry["status"] | null }[];
} {
  const lines = rawText.split("\n");
  const entries: ParsedEntry[] = [];
  const flagged: { line: string; sectionStatus: ParsedEntry["status"] | null }[] = [];
  let currentSection: ParsedEntry["status"] | null = null;

  for (const line of lines) {
    // Check for section heading
    const detectedSection = parseSection(line);
    if (detectedSection !== null) {
      currentSection = detectedSection;
      continue;
    }

    if (shouldSkipLine(line)) continue;

    // Pattern 1: Linked entry with MAL URL
    const linkedMatch = line.match(LINKED_ENTRY_REGEX);
    if (linkedMatch) {
      const [, title, id, trailing] = linkedMatch;
      const { note } = splitTitleAndNote(trailing.trimStart());
      let rating: number | null = null;
      if (note) {
        const ratingResult = extractRating(note);
        rating = ratingResult.rating;
      }
      entries.push({
        title,
        mal_id: Number(id),
        status: currentSection,
        rating,
        notes: note,
        confidence: "parsed",
      });
      continue;
    }

    // Pattern 1b: Bare MAL URL
    const urlMatch = line.trim().match(MAL_URL_ONLY_REGEX);
    if (urlMatch) {
      entries.push({
        title: "",
        mal_id: Number(urlMatch[1]),
        status: currentSection,
        rating: null,
        notes: null,
        confidence: "parsed",
      });
      continue;
    }

    // Pattern 2: Unlinked entry
    // Strip leading bullet markers: "* ", "- ", "• "
    let content = line;
    if (/^[\*\-•]\s+/.test(content)) {
      content = content.replace(/^[\*\-•]\s+/, "");
    }

    // Try to extract inline status
    const inlineStatus = extractInlineStatus(content);
    let entryStatus = currentSection;
    if (inlineStatus) {
      entryStatus = inlineStatus.status;
      content = inlineStatus.cleaned;
    }

    // Split title and note
    const { title: rawTitle, note } = splitTitleAndNote(content);

    // Extract rating from note or title
    let rating: number | null = null;
    let cleanedNote = note;
    if (note) {
      const noteRating = extractRating(note);
      rating = noteRating.rating;
      cleanedNote = noteRating.cleaned || null;
    }
    if (rating === null) {
      const titleRating = extractRating(rawTitle);
      rating = titleRating.rating;
    }

    const title = rawTitle.replace(RATING_REGEX, "").trim();

    // If we got a reasonable title, emit as parsed entry
    if (title.length >= 2) {
      entries.push({
        title,
        mal_id: null,
        status: entryStatus,
        rating,
        notes: cleanedNote || null,
        confidence: "parsed",
      });
      continue;
    }

    // Flag for Claude fallback
    flagged.push({ line, sectionStatus: currentSection });
  }

  return { entries, flagged };
}

// --- Stage B: Claude Haiku fallback ---

export async function parseWithClaude(
  flagged: { line: string; sectionStatus: ParsedEntry["status"] | null }[]
): Promise<ParsedEntry[]> {
  if (flagged.length === 0) return [];

  const systemPrompt = `You are a parser that extracts structured anime list data from unformatted text.
Return ONLY a valid JSON array. No explanation, no markdown fences, no preamble.
Each object in the array must follow this exact shape:
{
  "title": string,
  "mal_id": number | null,
  "status": "watched" | "watching" | "queued" | "dropped" | null,
  "rating": number | null,
  "notes": string | null
}
If a field cannot be determined, use null. Never invent data.`;

  const groupedBySection = new Map<string, string[]>();
  for (const { line, sectionStatus } of flagged) {
    const key = sectionStatus || "unknown";
    if (!groupedBySection.has(key)) groupedBySection.set(key, []);
    groupedBySection.get(key)!.push(line);
  }

  let userMessage = "";
  for (const [section, lines] of groupedBySection) {
    userMessage += `Section context: ${section === "unknown" ? "null" : section}\n\nLines to parse:\n${lines.join("\n")}\n\n`;
  }

  // Skip Claude fallback if no API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — skipping Claude fallback for", flagged.length, "lines");
    return fallbackFromFlagged(flagged);
  }

  try {
    // TODO: Migrate to Anthropic SDK (@anthropic-ai/sdk) or Vercel AI SDK for
    // proper typing, streaming support, and error handling.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.status);
      return fallbackFromFlagged(flagged);
    }

    const data = await response.json();
    const text =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    // Strip accidental markdown fences
    const cleaned = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Array<{
      title: string;
      mal_id: number | null;
      status: string | null;
      rating: number | null;
      notes: string | null;
    }>;

    return parsed.map((item) => ({
      title: item.title || "",
      mal_id: item.mal_id ?? null,
      status: (item.status as ParsedEntry["status"]) ?? null,
      rating: item.rating ?? null,
      notes: item.notes ?? null,
      confidence: "inferred" as const,
    }));
  } catch (error) {
    console.error("Claude parse failed:", error);
    return fallbackFromFlagged(flagged);
  }
}

function fallbackFromFlagged(
  flagged: { line: string; sectionStatus: ParsedEntry["status"] | null }[]
): ParsedEntry[] {
  return flagged.map(({ line, sectionStatus }) => ({
    title: line.replace(/^[\*\-•]\s+/, "").trim(),
    mal_id: null,
    status: sectionStatus,
    rating: null,
    notes: null,
    confidence: "inferred" as const,
  }));
}

// --- Main entry point ---

export async function parseFile(rawText: string): Promise<ParsedEntry[]> {
  if (!rawText.trim()) return [];

  const { entries, flagged } = parseStructured(rawText);
  const inferred = await parseWithClaude(flagged);

  return [...entries, ...inferred];
}
