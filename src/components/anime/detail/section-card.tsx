import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";
import type React from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  accentColor?: string;
  className?: string;
  headerActions?: ReactNode;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function SectionCard({
  title,
  children,
  accentColor = "var(--accent)",
  className = "",
  headerActions,
  cardRef,
}: SectionCardProps) {
  return (
    <Card ref={cardRef} className={cn("shadow-lg", className)}>
      <CardHeader className="-mt-1 -mb-3">
        <CardTitle className="flex items-center justify-between text-base font-bold text-[var(--text)]">
          <div className="flex items-center gap-2">
            <span
              className="w-1 h-5 rounded-full shrink-0"
              style={{ background: accentColor }}
            />
            {title}
          </div>
          {headerActions}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
