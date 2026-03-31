import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invite, error } = await supabase
    .from("vault_invites")
    .insert({
      vault_id: vaultId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  const baseUrl = req.headers.get("origin") || "https://anivault.app";
  const inviteUrl = `${baseUrl}/join/${invite.token}`;

  return NextResponse.json({ token: invite.token, url: inviteUrl });
}
