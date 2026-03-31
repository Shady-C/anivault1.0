import { NextResponse, NextRequest } from "next/server";
import { searchAnime } from "@/lib/api/anime";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }
  const result = await searchAnime(query, 1, 10);
  return NextResponse.json({ data: result.data });
}
