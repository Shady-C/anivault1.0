import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-bold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none press-feedback",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-alt)] text-white shadow-lg",
        destructive: "bg-[var(--red)] text-white",
        outline: "border border-white/20 bg-white/5 text-[var(--text)] hover:bg-white/10",
        secondary: "bg-white/10 text-[var(--text)] hover:bg-white/15",
        ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-8 rounded-[10px] gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-[14px] px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
