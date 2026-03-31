import { cn } from "@/lib/utils/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-white/5", className)}
      {...props}
    />
  );
}

export { Skeleton };
