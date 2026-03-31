"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LoginClientProps {
  next?: string;
}

export default function LoginClient({ next }: LoginClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    if (next) callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <div className="text-6xl mb-4">🎌</div>
        <h1
          className="text-4xl font-black text-[var(--text)]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          AniVault
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Social anime tracking for your crew
        </p>
      </div>
      <div className="w-full max-w-sm">
        <div
          className="rounded-3xl p-6 border"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <h2 className="text-lg font-bold text-[var(--text)] mb-1">Sign in</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Continue with Google to track, rate, and share anime with your crew.
          </p>

          {error && <p className="text-xs text-[var(--red)] mb-4">{error}</p>}

          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            <Globe size={16} className="mr-2" />
            {loading ? "Redirecting..." : "Continue with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
