import { NextResponse, NextRequest } from "next/server";
import { upsertAnime } from "@/lib/supabase/queries/anime";
import { setUserAnimeData } from "@/lib/supabase/queries/user-anime-data";
import { getUserVaults, toggleAnimeInVault } from "@/lib/supabase/queries/vaults";

const MAL_STATUS_MAP: Record<string, string> = {
  completed: "watched",
  watching: "watching",
  on_hold: "queued",
  dropped: "dropped",
  plan_to_watch: "queued",
};

export async function POST(req: NextRequest) {
  const { anime: animeList, vaultId } = await req.json();

  if (!Array.isArray(animeList)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let targetVaultId = vaultId;

  if (!targetVaultId) {
    const vaults = await getUserVaults();
    const myList = vaults.find(v => v.type === "personal" && v.name === "My List");
    if (myList) targetVaultId = myList.id;
  }

  let imported = 0;
  for (const item of animeList) {
    try {
      const dbAnime = await upsertAnime({
        mal_id: item.mal_id,
        title: item.title,
        cover_image: item.cover_image ?? null,
        genres: item.genres ?? [],
      });

      if (!dbAnime) continue;

      if (targetVaultId) {
        await toggleAnimeInVault(targetVaultId, dbAnime.id, true);
      }

      const status = MAL_STATUS_MAP[item.status] || "watched";
      await setUserAnimeData(dbAnime.id, {
        status: status as never,
        rating: item.score > 0 ? (Math.ceil(item.score / 2) as 1|2|3|4|5) : null,
      });

      imported++;
    } catch (err) {
      console.error(`Failed to import ${item.title}:`, err);
    }
  }

  return NextResponse.json({ imported });
}
