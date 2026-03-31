import { NextResponse, NextRequest } from "next/server";
import { createVault } from "@/lib/supabase/queries/vaults";
import type { VaultType } from "@/types/vault";

export async function POST(req: NextRequest) {
  const { name, emoji, type } = await req.json();
  if (!name || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const data = await createVault(name, emoji || "📁", type as VaultType);
  if (!data) return NextResponse.json({ error: "Failed to create vault" }, { status: 500 });
  return NextResponse.json({ data });
}
