"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => setShowBanner(false), 2000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    if (!navigator.onLine) {
      setIsOnline(false);
      setShowBanner(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] transition-all duration-300 ${
        showBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium ${
          isOnline
            ? "bg-[var(--green)] text-white"
            : "bg-[var(--background)]/90 text-[var(--text-muted)] border-b border-white/8"
        }`}
        style={{ backdropFilter: "blur(10px)" }}
      >
        <WifiOff size={14} />
        {isOnline ? "Back online" : "You're offline — local data only"}
      </div>
    </div>
  );
}
