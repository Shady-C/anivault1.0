import { NextResponse, NextRequest } from "next/server";
import { searchLocalAnime } from "@/lib/supabase/queries/anime";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }
  const data = await searchLocalAnime(query, 8);
  return NextResponse.json({ data });
}
