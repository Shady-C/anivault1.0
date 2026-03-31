import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const metadata = user.user_metadata ?? {};
        const name =
          (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
          (typeof metadata.name === "string" && metadata.name.trim()) ||
          user.email?.split("@")[0] ||
          "User";
        const avatarUrl =
          typeof metadata.avatar_url === "string" && metadata.avatar_url.trim()
            ? metadata.avatar_url
            : null;

        await supabase.from("users").insert({
          id: user.id,
          name,
          email: user.email!,
          avatar_url: avatarUrl,
          theme: "system",
          notification_preferences: {
            vault_add: true,
            recommendations: true,
            airing: true,
          },
        });

        const { data: vault } = await supabase
          .from("vaults")
          .insert({ name: "My List", emoji: "⭐", type: "personal" })
          .select()
          .single();

        if (vault) {
          await supabase.from("vault_members").insert({
            vault_id: vault.id,
            user_id: user.id,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
