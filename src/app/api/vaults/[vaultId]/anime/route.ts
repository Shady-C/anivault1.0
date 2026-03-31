import { NextResponse, NextRequest } from "next/server";
import { toggleAnimeInVault } from "@/lib/supabase/queries/vaults";

export async function POST(req: NextRequest, { params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = await params;
  const { animeId } = await req.json();
  await toggleAnimeInVault(vaultId, animeId, true);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = await params;
  const { animeId } = await req.json();
  await toggleAnimeInVault(vaultId, animeId, false);
  return NextResponse.json({ success: true });
}
