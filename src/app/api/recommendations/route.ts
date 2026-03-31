import { NextResponse, NextRequest } from "next/server";
import { sendRecommendation, getInboxRecommendations, updateRecommendationStatus } from "@/lib/supabase/queries/recommendations";

export async function GET() {
  const data = await getInboxRecommendations();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { toUserId, animeId, vaultId, message } = await req.json();
  if (!toUserId || !animeId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const data = await sendRecommendation(toUserId, animeId, vaultId, message);
  if (!data) return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const { recId, status } = await req.json();
  if (!recId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await updateRecommendationStatus(recId, status);
  return NextResponse.json({ success: true });
}
