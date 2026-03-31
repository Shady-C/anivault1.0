import { NextResponse, NextRequest } from "next/server";
import { toggleFollow } from "@/lib/supabase/queries/schedule";

export async function POST(req: NextRequest) {
  const { upcomingAnimeId } = await req.json();
  if (!upcomingAnimeId) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const isFollowing = await toggleFollow(upcomingAnimeId);
  return NextResponse.json({ following: isFollowing });
}
