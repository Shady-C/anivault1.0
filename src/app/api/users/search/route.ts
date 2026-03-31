import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const vaultId = searchParams.get("vaultId");

  if (!q || q.length < 1) return NextResponse.json({ users: [] });

  // Get existing vault member user_ids to exclude
  let existingMemberIds: string[] = [user.id];
  if (vaultId) {
    const { data: members } = await supabase
      .from("vault_members")
      .select("user_id")
      .eq("vault_id", vaultId);
    if (members) {
      existingMemberIds = [...existingMemberIds, ...members.map((m) => m.user_id)];
    }
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, avatar_url")
    .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    .not("id", "in", `(${existingMemberIds.join(",")})`)
    .limit(10);

  if (error) return NextResponse.json({ error: "Search failed" }, { status: 500 });

  return NextResponse.json({ users: data ?? [] });
}
