import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--accent)] text-white",
        secondary: "border-transparent bg-white/10 text-[var(--text)]",
        destructive: "border-transparent bg-[var(--red)] text-white",
        outline: "border-white/20 text-[var(--text-muted)]",
        purple: "border-transparent bg-[var(--purple)] text-white",
        green: "border-transparent bg-[var(--green)] text-white",
        blue: "border-transparent bg-[var(--blue)] text-white",
        yellow: "border-transparent bg-[var(--yellow)] text-black",
        cyan: "border-transparent bg-[var(--cyan)] text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
