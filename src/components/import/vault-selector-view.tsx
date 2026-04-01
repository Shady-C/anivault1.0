"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IngestResult, SearchResultEntry } from "@/lib/pipeline/types";

interface VaultOption {
  id: string;
  name: string;
  emoji: string;
}

interface VaultSelectorViewProps {
  confirmedCount: number;
  searchResults: Record<number, SearchResultEntry>;
  onConfirm: (vaultId: string) => Promise<IngestResult>;
  onBack: () => void;
}

export default function VaultSelectorView({
  confirmedCount,
  searchResults,
  onConfirm,
  onBack,
}: VaultSelectorViewProps) {
  const [vaults, setVaults] = useState<VaultOption[]>([]);
  const [selectedVault, setSelectedVault] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📚");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const values = Object.values(searchResults);
  const approved = values.filter((r) => r.status === "approved").length;
  const rejected = values.filter((r) => r.status === "rejected").length;
  const pending = values.filter((r) => r.status === "pending").length;

  useEffect(() => {
    fetch("/api/vaults")
      .then((r) => r.json())
      .then((data) => {
        const list = (data as VaultOption[]) || [];
        setVaults(list);
        if (list.length > 0) setSelectedVault(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleCreateVault = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          emoji: newEmoji,
          type: "personal",
        }),
      });
      const vault = await res.json();
      if (vault.id) {
        setVaults((prev) => [...prev, vault]);
        setSelectedVault(vault.id);
        setCreating(false);
        setNewName("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedVault) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onConfirm(selectedVault);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-8">
        <h2 className="mb-4 font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">
          Import Complete
        </h2>
        <Card>
          <CardContent className="space-y-2 text-sm text-[var(--text)]">
            <p>
              <span className="text-green-400">{result.inserted}</span> anime
              added to database
            </p>
            <p>
              <span className="text-green-400">
                {result.vault_anime_created}
              </span>{" "}
              added to vault
            </p>
            <p>
              <span className="text-blue-400">
                {result.user_anime_data_created}
              </span>{" "}
              tracking records created
            </p>
            {result.skipped > 0 && (
              <p>
                <span className="text-[var(--text-muted)]">
                  {result.skipped}
                </span>{" "}
                skipped (already in vault or invalid)
              </p>
            )}
          </CardContent>
        </Card>
        <div className="mt-4">
          <Button asChild>
            <a href="/vaults">Go to Vaults</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <h2 className="mb-2 font-[var(--font-heading)] text-2xl font-bold text-[var(--text)]">
        Import to Vault
      </h2>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="text-sm text-[var(--text)]">
          <span className="text-green-400">{approved} approved</span> &bull;{" "}
          <span className="text-red-400">{rejected} rejected</span> &bull;{" "}
          <span className="text-[var(--text-muted)]">{pending} pending</span>
          <p className="mt-1 text-[var(--text-muted)]">
            {confirmedCount} anime will be imported
          </p>
        </CardContent>
      </Card>

      {/* Vault selection */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          Select vault
        </label>
        <select
          value={selectedVault}
          onChange={(e) => setSelectedVault(e.target.value)}
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)]"
        >
          {vaults.map((v) => (
            <option key={v.id} value={v.id}>
              {v.emoji} {v.name}
            </option>
          ))}
        </select>
      </div>

      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mb-6 text-sm text-[var(--accent)] hover:underline"
        >
          + Create new vault
        </button>
      ) : (
        <div className="mb-6 flex gap-2">
          <input
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            className="w-12 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2 text-center text-sm"
            maxLength={2}
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Vault name"
            className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)]"
          />
          <Button size="sm" onClick={handleCreateVault} disabled={loading}>
            Create
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreating(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleConfirm}
          disabled={loading || !selectedVault || confirmedCount === 0}
        >
          {loading
            ? "Importing..."
            : `Import ${confirmedCount} anime`}
        </Button>
        <Button variant="outline" onClick={onBack}>
          Back to review
        </Button>
      </div>
    </div>
  );
}
