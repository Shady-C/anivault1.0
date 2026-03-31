"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { VaultWithMembers } from "@/types/vault";

interface VaultCardProps {
  vault: VaultWithMembers;
  className?: string;
}

export function VaultCard({ vault, className }: VaultCardProps) {
  return (
    <Link href={`/vaults/${vault.id}`} className={cn("block press-feedback", className)}>
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)]">
        {/* Emoji */}
        <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 shrink-0">
          {vault.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[var(--text)] truncate">{vault.name}</h3>
            {vault.type === "shared" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--purple)]/20 text-[var(--purple)] font-medium shrink-0">
                Shared
              </span>
            )}
            {(vault.new_count ?? 0) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white font-bold shrink-0">
                +{vault.new_count} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            {/* Member avatars */}
            <div className="flex -space-x-1">
              {vault.members.slice(0, 5).map((member) => (
                <div
                  key={member.user_id}
                  className="w-5 h-5 rounded-full bg-white/10 border border-[var(--background)] flex items-center justify-center text-[10px]"
                  title={member.user?.name}
                >
                  {member.user?.name?.charAt(0)?.toUpperCase() || "👤"}
                </div>
              ))}
              {vault.members.length > 5 && (
                <div className="w-5 h-5 rounded-full bg-white/10 border border-[var(--background)] flex items-center justify-center text-[9px] text-[var(--text-muted)]">
                  +{vault.members.length - 5}
                </div>
              )}
            </div>

            <span className="text-xs text-[var(--text-muted)]">
              {vault.anime_count ?? 0} anime
            </span>
          </div>
        </div>

        <div className="text-[var(--text-muted)] shrink-0">›</div>
      </div>
    </Link>
  );
}
