"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Search, Layers, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/schedule", icon: Calendar, label: "Schedule" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/vaults", icon: Layers, label: "Vaults" },
  { href: "/profile", icon: User, label: "Profile" },
];

interface BottomNavProps {
  unreadCount?: number;
}

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{
        background: "rgba(6, 6, 12, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          const isSearch = href === "/search";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[52px] relative press-feedback",
                isSearch
                  ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-alt)] rounded-2xl p-3 -mt-4 shadow-xl"
                  : "py-2 px-3"
              )}
            >
              {label === "Home" && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--accent)] rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse-scale">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <Icon
                size={isSearch ? 20 : 22}
                className={cn(
                  "transition-colors",
                  isSearch
                    ? "text-white"
                    : isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!isSearch && (
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                  )}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
