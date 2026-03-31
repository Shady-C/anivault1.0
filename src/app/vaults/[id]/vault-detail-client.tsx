"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimeCard } from "@/components/anime/anime-card";
import { PageContainer } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewToggle } from "@/hooks/use-view-toggle";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, LogOut } from "lucide-react";
import type { VaultDetail } from "@/types/vault";

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

  const filteredAnime = vault.anime.filter((va) => {
    const matchesSearch = !search || va.anime?.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || va.user_anime_data?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLeave = async () => {
    if (!confirm("Leave this vault? You can rejoin via invite.")) return;
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
                onClick={() => {/* TODO: invite sheet */}}
                className="p-2 rounded-xl bg-white/5"
                title="Invite member"
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

      <BottomNav />
    </PageContainer>
  );
}
