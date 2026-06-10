import { cn } from "@/lib/utils";

export function Shimmer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-[linear-gradient(90deg,var(--muted-foreground),var(--foreground),var(--muted-foreground))] bg-[length:200%_100%] bg-clip-text text-transparent animate-pulse text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
