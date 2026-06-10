import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Conversation({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  return (
    <div ref={ref} className={cn("flex-1 overflow-y-auto", className)}>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">{children}</div>
    </div>
  );
}
