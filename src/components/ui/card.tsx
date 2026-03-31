import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border py-5 shadow-sm backdrop-blur-sm",
        "bg-[var(--card)] border-[var(--card-border)]",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div data-slot="card-header" className={cn("grid gap-1.5 px-5", className)} {...props} />;
}

export type CardTitleProps = React.HTMLAttributes<HTMLDivElement>;

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none tracking-tight text-[var(--text)]", className)}
      {...props}
    />
  );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div data-slot="card-description" className={cn("text-sm text-[var(--text-muted)]", className)} {...props} />
  );
}

export type CardActionProps = React.HTMLAttributes<HTMLDivElement>;

function CardAction({ className, ...props }: CardActionProps) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

function CardContent({ className, ...props }: CardContentProps) {
  return <div data-slot="card-content" className={cn("px-5", className)} {...props} />;
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

function CardFooter({ className, ...props }: CardFooterProps) {
  return <div data-slot="card-footer" className={cn("flex items-center px-5", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
