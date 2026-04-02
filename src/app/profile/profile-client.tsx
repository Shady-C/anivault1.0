"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import type { User } from "@/types/user";
import { LogOut, FileInput, Pencil, Globe } from "lucide-react";

interface ProfileClientProps {
  profile: User | null;
  isAuthenticated: boolean;
}

const DEFAULT_PREFS = {
  vault_add: true,
  recommendations: true,
  airing: true,
};

export function ProfileClient({ profile, isAuthenticated }: ProfileClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [theme, setTheme] = useState<"light" | "dark" | "system">(profile?.theme || "system");
  const [prefs, setPrefs] = useState(profile?.notification_preferences || DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!profile) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 32) return;

    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ name: trimmed })
      .eq("id", profile!.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const updateTheme = async (nextTheme: "light" | "dark" | "system") => {
    if (!profile) return;
    setTheme(nextTheme);
    const supabase = createClient();
    const { error } = await supabase.from("users").update({ theme: nextTheme }).eq("id", profile.id);
    if (error) setError(error.message);
  };

  const updatePrefs = async (
    partial: Partial<{ vault_add: boolean; recommendations: boolean; airing: boolean; all: boolean }>
  ) => {
    if (!profile) return;
    const nextPrefs = {
      ...prefs,
      ...(partial.all
        ? {
            vault_add: true,
            recommendations: true,
            airing: true,
          }
        : partial),
    };
    setPrefs(nextPrefs);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ notification_preferences: nextPrefs })
      .eq("id", profile.id);
    if (error) setError(error.message);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/profile");
  };

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <PageHeader title="Profile" />
        <div className="px-4 mt-8 text-center">
          <div className="text-5xl mb-3">🎌</div>
          <h2 className="text-xl font-bold text-[var(--text)]">Sign in to personalize AniVault</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Track, rate, and share anime with your crew.
          </p>
          <Button className="mt-6" onClick={() => router.push("/login")}>
            <Globe size={16} className="mr-2" />
            Continue with Google
          </Button>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  const initial = (profile?.name?.charAt(0) || "U").toUpperCase();
  const allNotificationsOn = prefs.vault_add && prefs.recommendations && prefs.airing;

  return (
    <PageContainer>
      <PageHeader title="Profile" />

      <div className="px-4 space-y-6 mt-4">
        <div className="flex flex-col items-center gap-3 py-4">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border border-[var(--card-border)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/10 border border-[var(--card-border)] flex items-center justify-center text-2xl font-bold text-[var(--text)]">
              {initial}
            </div>
          )}
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--text)]">{name || profile?.name || "User"}</h2>
            <p className="text-sm text-[var(--text-muted)]">Google Account: {profile?.email}</p>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil size={14} className="mr-1" />
              Edit Profile
            </Button>
          )}
        </div>

        {editing && (
          <div className="space-y-4 rounded-3xl bg-[var(--card)] border border-[var(--card-border)] p-5">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Display Name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={32} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveName} disabled={saving || !name.trim()} className="flex-1">
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-4">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((mode) => (
              <Button
                key={mode}
                variant={theme === mode ? "default" : "outline"}
                onClick={() => updateTheme(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-4 space-y-3">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Notifications</p>
          <label className="flex items-center justify-between text-sm text-[var(--text)]">
            Vault additions
            <input type="checkbox" checked={prefs.vault_add} onChange={(e) => updatePrefs({ vault_add: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between text-sm text-[var(--text)]">
            Recommendations
            <input type="checkbox" checked={prefs.recommendations} onChange={(e) => updatePrefs({ recommendations: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between text-sm text-[var(--text)]">
            Airing reminders
            <input type="checkbox" checked={prefs.airing} onChange={(e) => updatePrefs({ airing: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between text-sm text-[var(--text)] border-t border-[var(--card-border)] pt-3">
            All notifications
            <input type="checkbox" checked={allNotificationsOn} onChange={(e) => updatePrefs(e.target.checked ? { all: true } : { vault_add: false, recommendations: false, airing: false })} />
          </label>
        </div>

        <div
          className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] press-feedback cursor-pointer"
          onClick={() => router.push("/import")}
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--blue)]/20 flex items-center justify-center">
            <FileInput size={20} className="text-[var(--blue)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Import from MAL</p>
            <p className="text-xs text-[var(--text-muted)]">Import your MyAnimeList history</p>
          </div>
          <span className="ml-auto text-[var(--text-muted)]">›</span>
        </div>

        {/* Sign out */}
        <Button variant="ghost" className="w-full text-[var(--red)]" onClick={handleSignOut}>
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>

        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
