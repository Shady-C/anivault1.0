"use client";

import { useCallback, useRef, useState } from "react";
import { RateLimiter } from "@/lib/pipeline/rate-limiter";
import { scoreConfidence } from "@/lib/pipeline/confidence";
import type { ParsedEntry, JikanResult, JikanBlob, SearchResultEntry } from "@/lib/pipeline/types";

function mapResult(data: Record<string, unknown>): JikanResult {
  const images = data.images as
    | Record<string, Record<string, string>>
    | undefined;
  return {
    malId: data.mal_id as number,
    title: (data.title as string) || "",
    titleEnglish: (data.title_english as string | null) ?? null,
    year: (data.year as number | null) ?? null,
    score: (data.score as number | null) ?? null,
    episodes: (data.episodes as number | null) ?? null,
    synopsis: data.synopsis ? (data.synopsis as string).slice(0, 200) : null,
    coverImage:
      images?.jpg?.large_image_url || images?.jpg?.image_url || null,
    airingStatus: (data.status as string) || "",
    type: (data.type as string) || "",
  };
}

export interface SearchProgress {
  total: number;
  completed: number;
  isRunning: boolean;
  currentTitle: string;
}

export function useImportSearch() {
  const abortRef = useRef<AbortController | null>(null);
  const limiterRef = useRef(new RateLimiter(400));
  const [searchProgress, setSearchProgress] = useState<SearchProgress>({
    total: 0,
    completed: 0,
    isRunning: false,
    currentTitle: "",
  });

  const cancelSearch = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setSearchProgress((prev) => ({
      ...prev,
      isRunning: false,
      currentTitle: "",
    }));
  }, []);

  const runBatchSearch = useCallback(
    async (
      entries: ParsedEntry[],
      onResult: (index: number, result: SearchResultEntry) => void
    ) => {
      cancelSearch();
      const controller = new AbortController();
      abortRef.current = controller;

      const toProcess = entries.map((entry, index) => ({ entry, index }));

      setSearchProgress({
        total: toProcess.length,
        completed: 0,
        isRunning: true,
        currentTitle: "Checking cache...",
      });

      // Phase 1: Batch cache check for MAL-linked entries
      const malLinked = toProcess.filter((e) => e.entry.mal_id !== null);
      let cachedBlobs: Record<string, JikanBlob> = {};

      if (malLinked.length > 0) {
        try {
          const res = await fetch("/api/import/cache-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              malIds: malLinked.map((e) => e.entry.mal_id),
            }),
            signal: controller.signal,
          });
          if (res.ok) cachedBlobs = await res.json();
        } catch {
          // Cache check failed — fall through to search
        }
      }

      // Phase 2: Resolve cache hits immediately, search for the rest
      for (const { entry, index } of toProcess) {
        if (controller.signal.aborted) break;

        setSearchProgress((prev) => ({
          ...prev,
          currentTitle: entry.title || `MAL #${entry.mal_id}`,
        }));

        // Check if we have a cache hit for this MAL-linked entry
        if (entry.mal_id !== null && cachedBlobs[String(entry.mal_id)]) {
          const blob = cachedBlobs[String(entry.mal_id)];
          const detail = blob.detail as Record<string, unknown>;
          const displayMatch = mapResult(detail);

          onResult(index, {
            query: entry.title,
            results: [displayMatch],
            topMatch: displayMatch,
            confidence: "high",
            status: "approved",
            approvedMatch: displayMatch,
            fetchedBlob: blob,
          });

          setSearchProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }));
          continue;
        }

        // Cache miss or name-only: search via Jikan (1 call each)
        onResult(index, {
          query: entry.title,
          results: [],
          topMatch: null,
          confidence: "none",
          status: "searching",
          approvedMatch: null,
        });

        try {
          const searchData = await limiterRef.current.enqueue(async () => {
            const res = await fetch(
              `/api/import/search?q=${encodeURIComponent(entry.title)}`,
              { signal: controller.signal }
            );
            if (!res.ok) throw new Error(`Search failed: ${res.status}`);
            return res.json();
          });

          const results = (
            (searchData.data || []) as Record<string, unknown>[]
          ).map(mapResult);
          const topMatch = results[0] ?? null;
          const confidence =
            results.length === 0
              ? ("none" as const)
              : scoreConfidence(entry.title, topMatch);

          // MAL-linked cache misses with a high-confidence match get auto-approved
          const isLinkedMiss = entry.mal_id !== null;
          const isHighMatch = confidence === "high" && topMatch;

          onResult(index, {
            query: entry.title,
            results,
            topMatch,
            confidence,
            status: results.length === 0
              ? "no-results"
              : isLinkedMiss && isHighMatch
                ? "approved"
                : "pending",
            approvedMatch: isLinkedMiss && isHighMatch ? topMatch : null,
          });
        } catch (error) {
          if (controller.signal.aborted) break;
          onResult(index, {
            query: entry.title,
            results: [],
            topMatch: null,
            confidence: "none",
            status: "failed",
            approvedMatch: null,
            error: error instanceof Error ? error.message : "Search failed",
          });
        }

        setSearchProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      }

      setSearchProgress((prev) => ({
        ...prev,
        isRunning: false,
        currentTitle: "",
      }));
    },
    [cancelSearch]
  );

  return { runBatchSearch, cancelSearch, searchProgress };
}
