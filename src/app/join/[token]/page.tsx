import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function JoinVaultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/join/${token}`);

  const { data: invite } = await supabase
    .from("vault_invites")
    .select("*, vaults (id, name, emoji)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!invite) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl mb-3">❌</p>
        <h1 className="text-xl font-bold text-[var(--text)]">Invalid or expired invite</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">This invite link may have expired (7 days).</p>
        <Link href="/" className="mt-6">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    );
  }

  const vault = invite.vaults as { id: string; name: string; emoji: string };

  async function handleJoin() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("vault_members").upsert(
      { vault_id: vault.id, user_id: user.id },
      { onConflict: "vault_id,user_id" }
    );

    redirect(`/vaults/${vault.id}`);
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6">
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center border"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="text-6xl mb-3">{vault.emoji}</div>
        <h1 className="text-xl font-black text-[var(--text)]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          Join {vault.name}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          You&apos;ve been invited to join this shared vault.
        </p>

        <form action={handleJoin} className="mt-6 space-y-3">
          <Button type="submit" className="w-full">
            Join Vault
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full mt-2">Decline</Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
