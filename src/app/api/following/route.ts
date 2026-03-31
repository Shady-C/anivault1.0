import { NextResponse } from "next/server";
import { getFollowedShows } from "@/lib/supabase/queries/schedule";

export async function GET() {
  const data = await getFollowedShows();
  return NextResponse.json({ data });
}
