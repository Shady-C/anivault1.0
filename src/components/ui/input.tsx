import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-[14px] border px-4 py-2 text-sm text-[var(--text)] shadow-xs transition-colors outline-none",
        "bg-white/5 border-white/8 placeholder:text-[var(--text-muted)]",
        "focus-visible:border-[var(--accent)]/40 focus-visible:bg-white/8",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
