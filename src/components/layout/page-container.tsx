import { cn } from "@/lib/utils/cn";
import type { ReactNode, ElementType } from "react";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  as?: ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function PageContainer({
  children,
  className,
  noPadding = false,
  as: Component = "div",
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "w-full",
        !noPadding && "pb-24 pt-4",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, description, className, rightSlot }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div>
        <h1
          className="text-2xl font-black text-[var(--text)]"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {title}
        </h1>
        {description && <p className="text-sm text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </div>
  );
}
