"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/import/file-upload";
import ReviewDashboard from "@/components/import/review-dashboard";
import VaultSelectorView from "@/components/import/vault-selector-view";
import SearchModal from "@/components/import/search-modal";
import { useImportSearch } from "@/hooks/use-import-search";
import type {
  ParsedEntry,
  JikanResult,
  JikanBlob,
  SearchResultEntry,
  FetchedEntry,
  IngestResult,
} from "@/lib/pipeline/types";

type Step = "upload" | "review" | "export";
type Filter = "all" | "pending" | "high" | "low-none" | "approved" | "rejected";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [searchResults, setSearchResults] = useState<
    Record<number, SearchResultEntry>
  >({});
  const [filter, setFilter] = useState<Filter>("all");
  const [manualSearch, setManualSearch] = useState<{
    entry: ParsedEntry;
    index: number;
  } | null>(null);
  const [parseLoading, setParseLoading] = useState(false);

  const { runBatchSearch, searchProgress } = useImportSearch();

  // --- Step 1: Parse ---
  const handleParse = useCallback(
    async (content: string) => {
      setParseLoading(true);
      try {
        const res = await fetch("/api/import/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: content }),
        });
        const data = await res.json();
        const entries: ParsedEntry[] = data.entries || [];
        setParsedEntries(entries);
        setSearchResults({});
        setStep("review");

        // Kick off batch search
        runBatchSearch(entries, (index, result) => {
          setSearchResults((prev) => ({ ...prev, [index]: result }));
        });

        const linked = entries.filter((e) => e.mal_id !== null).length;
        return {
          total: entries.length,
          linked,
          unlinked: entries.length - linked,
        };
      } finally {
        setParseLoading(false);
      }
    },
    [runBatchSearch]
  );

  // --- Step 2: Review actions ---
  const handleAccept = useCallback(
    (index: number, match: JikanResult | null) => {
      if (!match) return;
      setSearchResults((prev) => ({
        ...prev,
        [index]: { ...prev[index], status: "approved", approvedMatch: match },
      }));
    },
    []
  );

  const handleReject = useCallback((index: number) => {
    setSearchResults((prev) => ({
      ...prev,
      [index]: { ...prev[index], status: "rejected" },
    }));
  }, []);

  const handlePickOther = useCallback(
    (index: number, match: JikanResult) => {
      setSearchResults((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          status: "approved",
          approvedMatch: match,
          topMatch: match,
        },
      }));
    },
    []
  );

  const handleAutoApproveHigh = useCallback(() => {
    setSearchResults((prev) => {
      const next = { ...prev };
      for (const [key, result] of Object.entries(next)) {
        if (result.confidence === "high" && result.status === "pending" && result.topMatch) {
          next[Number(key)] = {
            ...result,
            status: "approved",
            approvedMatch: result.topMatch,
          };
        }
      }
      return next;
    });
  }, []);

  const handleSearchAll = useCallback(() => {
    runBatchSearch(parsedEntries, (index, result) => {
      setSearchResults((prev) => ({ ...prev, [index]: result }));
    });
  }, [parsedEntries, runBatchSearch]);

  const handleManualSearch = useCallback(
    (entry: ParsedEntry, index: number) => {
      setManualSearch({ entry, index });
    },
    []
  );

  const handleManualPick = useCallback(
    (match: JikanResult) => {
      if (!manualSearch) return;
      handleAccept(manualSearch.index, match);
      setManualSearch(null);
    },
    [manualSearch, handleAccept]
  );

  const handleRetry = useCallback(
    (entry: ParsedEntry, index: number) => {
      runBatchSearch([entry], (_, result) => {
        setSearchResults((prev) => ({ ...prev, [index]: result }));
      });
    },
    [runBatchSearch]
  );

  // --- Step 3: Ingest ---
  const handleConfirmImport = useCallback(
    async (vaultId: string): Promise<IngestResult> => {
      const confirmed: FetchedEntry[] = [];
      const needsFetch: { index: number; malId: number; entry: ParsedEntry }[] = [];

      // Separate entries with cached blobs from those needing fetch
      for (const [indexStr, result] of Object.entries(searchResults)) {
        if (result.status !== "approved" || !result.approvedMatch) continue;
        const index = Number(indexStr);
        const entry = parsedEntries[index];
        if (!entry) continue;

        if (result.fetchedBlob) {
          confirmed.push({
            parsed: entry,
            mal_id: result.approvedMatch.malId,
            jikan_blob: result.fetchedBlob,
            search_confidence: result.confidence,
          });
        } else {
          needsFetch.push({ index, malId: result.approvedMatch.malId, entry });
        }
      }

      // Bulk fetch entries that don't have cached blobs (name-only search results)
      if (needsFetch.length > 0) {
        try {
          const res = await fetch("/api/import/fetch-bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ malIds: needsFetch.map((e) => e.malId) }),
          });
          if (res.ok) {
            const blobs: Record<string, JikanBlob> = await res.json();
            for (const item of needsFetch) {
              const blob = blobs[String(item.malId)];
              if (blob) {
                confirmed.push({
                  parsed: item.entry,
                  mal_id: item.malId,
                  jikan_blob: blob,
                  search_confidence:
                    searchResults[item.index]?.confidence ?? "none",
                });
              }
            }
          }
        } catch {
          // Bulk fetch failed — entries without blobs are skipped
        }
      }

      // Batch ingest in chunks of 100 to stay under body size limits
      const BATCH_SIZE = 100;
      const totalResult: IngestResult = {
        inserted: 0,
        updated: 0,
        skipped: 0,
        vault_anime_created: 0,
        user_anime_data_created: 0,
      };

      for (let i = 0; i < confirmed.length; i += BATCH_SIZE) {
        const batch = confirmed.slice(i, i + BATCH_SIZE);
        const res = await fetch("/api/import/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: batch, vault_id: vaultId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Import failed");
        }

        const batchResult: IngestResult = await res.json();
        totalResult.inserted += batchResult.inserted;
        totalResult.updated += batchResult.updated;
        totalResult.skipped += batchResult.skipped;
        totalResult.vault_anime_created += batchResult.vault_anime_created;
        totalResult.user_anime_data_created += batchResult.user_anime_data_created;
      }

      // Fire-and-forget: backfill characters/episodes for entries with partial blobs
      const allMalIds = confirmed.map((e) => e.mal_id);
      if (allMalIds.length > 0) {
        fetch("/api/import/backfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ malIds: allMalIds }),
        }).catch(() => {
          // Background backfill — failure is non-critical
        });
      }

      return totalResult;
    },
    [parsedEntries, searchResults]
  );

  const confirmedCount = Object.values(searchResults).filter(
    (r) => r.status === "approved" && r.approvedMatch
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {step === "upload" && (
        <FileUpload onParse={handleParse} loading={parseLoading} />
      )}

      {step === "review" && (
        <ReviewDashboard
          entries={parsedEntries}
          searchResults={searchResults}
          searchProgress={searchProgress}
          filter={filter}
          setFilter={setFilter}
          onAutoApproveHigh={handleAutoApproveHigh}
          onSearchAll={handleSearchAll}
          onAccept={handleAccept}
          onReject={handleReject}
          onSearch={handleManualSearch}
          onPickOther={handlePickOther}
          onRetry={handleRetry}
          onExport={() => setStep("export")}
        />
      )}

      {step === "export" && (
        <VaultSelectorView
          confirmedCount={confirmedCount}
          searchResults={searchResults}
          onConfirm={handleConfirmImport}
          onBack={() => setStep("review")}
        />
      )}

      {manualSearch && (
        <SearchModal
          initialQuery={manualSearch.entry.title}
          onClose={() => setManualSearch(null)}
          onPick={handleManualPick}
        />
      )}
    </div>
  );
}
