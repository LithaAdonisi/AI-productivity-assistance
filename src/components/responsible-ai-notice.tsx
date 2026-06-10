import { ShieldCheck } from "lucide-react";

export function ResponsibleAiNotice() {
  return (
    <div className="glass flex items-start gap-3 rounded-xl p-4 text-xs text-muted-foreground shadow-glass">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        AI-generated content may contain errors or omissions. Review carefully before sharing,
        especially for client-facing or high-stakes work.
      </p>
    </div>
  );
}
