import { NextResponse } from "next/server";
import { leaveVault } from "@/lib/supabase/queries/vaults";

export async function POST(req: Request, { params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = await params;
  await leaveVault(vaultId);
  return NextResponse.json({ success: true });
}
