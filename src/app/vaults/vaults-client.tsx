"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { VaultCard } from "@/components/vault/vault-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VaultWithMembers, VaultType } from "@/types/vault";

const VAULT_EMOJIS = ["📁", "⭐", "🔥", "💀", "🌸", "🎌", "🤖", "👑", "🌊", "🎭", "💫", "🎬"];

interface VaultsClientProps {
  vaults: VaultWithMembers[];
  isAuthenticated: boolean;
}

export function VaultsClient({ vaults: initialVaults, isAuthenticated }: VaultsClientProps) {
  const router = useRouter();
  const [vaults, setVaults] = useState(initialVaults);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [type, setType] = useState<VaultType>("personal");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/vaults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), emoji, type }),
    });
    const json = await res.json();
    setCreating(false);
    if (json.data) {
      setVaults(prev => [...prev, { ...json.data, members: [], anime_count: 0, new_count: 0 }]);
      setShowCreate(false);
      setName("");
      setEmoji("📁");
      setType("personal");
      router.refresh();
    }
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <PageHeader title="Vaults" />
        <div className="px-4 mt-8 text-center">
          <p className="text-5xl mb-3">📦</p>
          <h2 className="text-xl font-bold text-[var(--text)]">Sign in to access your vaults</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Create and join vaults to track, rate, and share anime with your crew.
          </p>
          <Button className="mt-6" onClick={() => router.push("/login?next=/vaults")}>
            Continue with Google
          </Button>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Vaults"
        rightSlot={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-1" />
            New
          </Button>
        }
      />

      <div className="px-4 mt-4 space-y-3">
        {vaults.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <h3 className="text-lg font-bold text-[var(--text)]">No vaults yet</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Create your first vault to start tracking anime.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" />
              Create Vault
            </Button>
          </div>
        ) : (
          vaults.map((vault) => <VaultCard key={vault.id} vault={vault} />)
        )}
      </div>

      {/* Create vault sheet */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setShowCreate(false)} />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 animate-slide-up rounded-t-[28px] p-5"
            style={{
              background: "rgba(14,14,24,0.98)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
            }}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-[var(--text)]">Create Vault</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl bg-white/5">
                <X size={18} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {VAULT_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      emoji === e ? "ring-2 ring-[var(--accent)] bg-[var(--accent)]/10 scale-110" : "bg-white/5"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My Vault"
                maxLength={40}
                autoFocus
              />
            </div>

            {/* Type */}
            <div className="mb-5">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["personal", "shared"] as VaultType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`p-3 rounded-xl text-sm font-semibold text-center border transition-all ${
                      type === t
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-white/10 bg-white/4 text-[var(--text-muted)]"
                    }`}
                  >
                    {t === "personal" ? "🔒 Personal" : "👥 Shared"}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating ? "Creating..." : `Create ${emoji} ${name || "Vault"}`}
            </Button>
          </div>
        </>
      )}

      <BottomNav />
    </PageContainer>
  );
}
