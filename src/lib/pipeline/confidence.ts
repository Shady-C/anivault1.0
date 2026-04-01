import type { JikanResult } from "./types";

function normalize(text: string | null | undefined): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function scoreConfidence(
  query: string,
  topMatch: JikanResult | null
): "high" | "medium" | "low" | "none" {
  if (!topMatch) return "none";

  const q = normalize(query);
  const primary = normalize(topMatch.title);
  const english = normalize(topMatch.titleEnglish);
  const candidates = [primary, english].filter(Boolean);

  if (candidates.some((t) => t === q)) return "high";

  const highByCoverage = candidates.some((candidate) => {
    if (!candidate) return false;
    const shorter = Math.min(candidate.length, q.length);
    const longer = Math.max(candidate.length, q.length);
    if (!shorter || !longer) return false;
    return shorter / longer >= 0.8 && (candidate.includes(q) || q.includes(candidate));
  });
  if (highByCoverage) return "high";

  const mediumByQueryCoverage = candidates.some((candidate) => {
    if (!candidate || !q) return false;
    if (candidate.includes(q)) return true;
    const words = q.split(" ").filter(Boolean);
    if (words.length === 0) return false;
    const matched = words
      .filter((word) => candidate.includes(word))
      .join(" ");
    return matched.length / q.length >= 0.5;
  });

  if (mediumByQueryCoverage) return "medium";
  return "low";
}
