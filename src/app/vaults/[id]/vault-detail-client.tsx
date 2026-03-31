"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimeCard } from "@/components/anime/anime-card";
import { PageContainer } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewToggle } from "@/hooks/use-view-toggle";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, LogOut, X } from "lucide-react";
import type { VaultDetail } from "@/types/vault";

interface SearchUser {
  id: string;
  name: string;
  avatar_url: string | null;
}

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "watching", label: "Watching" },
  { key: "watched", label: "Watched" },
  { key: "queued", label: "Queued" },
  { key: "dropped", label: "Dropped" },
];

interface VaultDetailClientProps {
  vault: VaultDetail;
  currentUserId: string;
}

export function VaultDetailClient({ vault }: VaultDetailClientProps) {
  const router = useRouter();
  const { view, toggleView } = useViewToggle(`vault-${vault.id}`);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<SearchUser[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredAnime = vault.anime.filter((va) => {
    const matchesSearch = !search || va.anime?.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || va.user_anime_data?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMemberSearchChange = (value: string) => {
    setMemberSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setMemberResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSearch(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(value)}&vaultId=${vault.id}`);
      const data = await res.json();
      setMemberResults(data.users ?? []);
      setLoadingSearch(false);
    }, 300);
  };

  const handleAddMember = async (userId: string, userName: string) => {
    setAddingUserId(userId);
    const res = await fetch(`/api/vaults/${vault.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setMemberResults((prev) => prev.filter((u) => u.id !== userId));
      router.refresh();
    }
    setAddingUserId(null);
  };

  const handleLeave = async () => {
    if (!confirm("Leave this vault?")) return;
    await fetch(`/api/vaults/${vault.id}/leave`, { method: "POST" });
    router.push("/vaults");
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{vault.emoji}</div>
            <div>
              <h1
                className="text-xl font-black text-[var(--text)]"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {vault.name}
              </h1>
              <div className="flex items-center gap-1 mt-1">
                {vault.members.slice(0, 5).map((m) => (
                  <Avatar key={m.user_id} className="w-5 h-5">
                    <AvatarFallback className="text-[9px]">
                      {m.user?.name?.charAt(0)?.toUpperCase() || "👤"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {vault.members.length > 5 && (
                  <span className="text-[10px] text-[var(--text-muted)]">+{vault.members.length - 5}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {vault.type === "shared" && (
              <button
                onClick={() => {
                  setShowAddMember(true);
                  setMemberSearch("");
                  setMemberResults([]);
                }}
                className="p-2 rounded-xl bg-white/5"
                title="Add member"
              >
                <UserPlus size={18} className="text-[var(--text-muted)]" />
              </button>
            )}
            <button
              onClick={handleLeave}
              className="p-2 rounded-xl bg-white/5"
              title="Leave vault"
            >
              <LogOut size={18} className="text-[var(--text-muted)]" />
            </button>
            <ViewToggle view={view} onToggle={toggleView} />
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === key
                  ? "bg-[var(--accent)] text-white"
                  : "bg-white/8 text-[var(--text-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
          <Input
            type="search"
            placeholder="Search this vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Anime grid/list */}
      <div className={`px-4 ${view === "grid" ? "grid grid-cols-3 gap-3" : "space-y-2"}`}>
        {filteredAnime.length === 0 ? (
          <div className="col-span-3 py-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-[var(--text-muted)]">
              {search ? "No results found." : "This vault is empty. Add some anime!"}
            </p>
          </div>
        ) : (
          filteredAnime.map((va) => {
            if (!va.anime) return null;
            return (
              <AnimeCard
                key={va.anime_id}
                anime={va.anime}
                userAnimeData={va.user_anime_data as never}
                className={view === "list" ? "w-full" : undefined}
              />
            );
          })
        )}
      </div>

      {/* Add Member sheet */}
      {showAddMember && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[49]"
            onClick={() => setShowAddMember(false)}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[var(--surface)] rounded-t-2xl z-[60] px-4 pt-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">
                Add to {vault.name}
              </h2>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-1.5 rounded-lg bg-white/5"
              >
                <X size={18} className="text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
              <Input
                type="search"
                placeholder="Search by name or email…"
                value={memberSearch}
                onChange={(e) => handleMemberSearchChange(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {loadingSearch && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">Searching…</p>
            )}

            {!loadingSearch && memberSearch.trim() && memberResults.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No users found.</p>
            )}

            {memberResults.length > 0 && (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {memberResults.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm text-[var(--text)] truncate">{u.name}</span>
                    <button
                      onClick={() => handleAddMember(u.id, u.name)}
                      disabled={addingUserId === u.id}
                      className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold disabled:opacity-50"
                    >
                      {addingUserId === u.id ? "Adding…" : "Add"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <BottomNav />
    </PageContainer>
  );
}
