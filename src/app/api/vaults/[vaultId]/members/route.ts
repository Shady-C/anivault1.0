import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify caller is a vault member
  const { data: membership } = await supabase
    .from("vault_members")
    .select("user_id")
    .eq("vault_id", vaultId)
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { error } = await supabase
    .from("vault_members")
    .insert({ vault_id: vaultId, user_id: userId });

  if (error) return NextResponse.json({ error: "Failed to add member" }, { status: 500 });

  return NextResponse.json({ success: true });
}
