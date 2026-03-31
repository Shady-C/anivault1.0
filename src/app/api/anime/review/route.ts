import { NextResponse, NextRequest } from "next/server";
import { setUserAnimeData } from "@/lib/supabase/queries/user-anime-data";
import type { AnimeStatus } from "@/types/anime";

export async function POST(req: NextRequest) {
  const { animeId, status, rating, vibes, hot_take } = await req.json();
  if (!animeId) return NextResponse.json({ error: "Missing animeId" }, { status: 400 });

  const data = await setUserAnimeData(animeId, {
    status: status as AnimeStatus | null,
    rating: rating as 1 | 2 | 3 | 4 | 5 | null,
    vibes,
    hot_take,
  });

  if (!data) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ data });
}
