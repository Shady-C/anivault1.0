import { NextResponse, NextRequest } from "next/server";
import { addWatchSource } from "@/lib/supabase/queries/watch-sources";

export async function POST(req: NextRequest) {
  const { animeId, url } = await req.json();
  if (!animeId || !url) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const data = await addWatchSource(animeId, url);
  if (!data) return NextResponse.json({ error: "Failed to add source" }, { status: 500 });
  return NextResponse.json({ data });
}
