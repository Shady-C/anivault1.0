"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VaultWithMembers } from "@/types/vault";

interface VaultChecklistSheetProps {
  isOpen: boolean;
  onClose: () => void;
  animeId: string;
  animeTitle: string;
  vaults: VaultWithMembers[];
  checkedVaultIds: string[];
  onToggle: (vaultId: string, add: boolean) => Promise<void>;
  onCreateVault?: () => void;
}

export function VaultChecklistSheet({
  isOpen,
  onClose,
  animeTitle,
  vaults,
  checkedVaultIds,
  onToggle,
  onCreateVault,
}: VaultChecklistSheetProps) {
  const [localChecked, setLocalChecked] = useState<Set<string>>(new Set(checkedVaultIds));
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setLocalChecked(new Set(checkedVaultIds));
  }, [checkedVaultIds]);

  const handleToggle = async (vaultId: string) => {
    const wasChecked = localChecked.has(vaultId);
    setLoading(vaultId);

    setLocalChecked(prev => {
      const next = new Set(prev);
      if (wasChecked) next.delete(vaultId);
      else next.add(vaultId);
      return next;
    });

    try {
      await onToggle(vaultId, !wasChecked);
    } catch {
      setLocalChecked(prev => {
        const next = new Set(prev);
        if (wasChecked) next.add(vaultId);
        else next.delete(vaultId);
        return next;
      });
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 animate-slide-up"
        style={{
          background: "rgba(14, 14, 24, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px 24px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "92vh",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-white/8">
          <div>
            <h2 className="font-bold text-[var(--text)]">Add to Vault</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-[240px]">{animeTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5">
            <X size={18} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Vault list */}
        <div className="overflow-y-auto max-h-[50vh] px-4 py-3 space-y-2">
          {vaults.map((vault) => {
            const checked = localChecked.has(vault.id);
            const isLoading = loading === vault.id;

            return (
              <button
                key={vault.id}
                onClick={() => handleToggle(vault.id)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all press-feedback"
                style={{
                  background: checked ? "rgba(255,107,53,0.1)" : "rgba(255,255,255,0.04)",
                  borderColor: checked ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-2xl">{vault.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[var(--text)]">{vault.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{vault.anime_count ?? 0} anime</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    checked
                      ? "bg-[var(--accent)] border-[var(--accent)]"
                      : "border-white/20"
                  }`}
                >
                  {checked && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            );
          })}

          {/* New vault option */}
          <button
            onClick={onCreateVault}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/15 text-[var(--text-muted)] press-feedback"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="text-sm">New Vault</span>
          </button>
        </div>

        <div className="px-4 pt-3 pb-5">
          <Button onClick={onClose} className="w-full">Done</Button>
        </div>
      </div>
    </>
  );
}
