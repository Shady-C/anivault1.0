"use client";

import { useRouter } from "next/navigation";
import { GlobalSearch } from "@/components/search/global-search";
import { PageContainer } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function SearchPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className="px-4 pt-4 pb-3">
        <h1
          className="text-2xl font-black text-[var(--text)] mb-4"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Search
        </h1>
        <GlobalSearch
          autoFocus
          onResultClick={(anime) => {
            if (anime.mal_id) {
              router.push(`/anime/${anime.mal_id}`);
            }
          }}
        />
      </div>

      <div className="px-4 pt-6">
        <p className="text-xs text-[var(--text-muted)] text-center">
          Search by title, studio, or genre
        </p>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
