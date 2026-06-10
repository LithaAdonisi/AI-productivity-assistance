import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant text-primary-foreground font-bold",
        className,
      )}
    >
      W
    </div>
  );
}

export function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight">Workplace AI</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Productivity Suite
        </span>
      </div>
    </div>
  );
}
