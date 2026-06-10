import { forwardRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function PromptInput({
  onSubmit,
  children,
  className,
}: {
  onSubmit: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={cn(
        "glass mx-auto w-full max-w-3xl rounded-2xl p-2 shadow-elegant",
        className,
      )}
    >
      {children}
    </form>
  );
}

export const PromptInputTextarea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea> & { onSend?: () => void }
>(function PromptInputTextarea({ className, onSend, onKeyDown, ...props }, ref) {
  return (
    <Textarea
      ref={ref}
      rows={1}
      className={cn(
        "min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
        className,
      )}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSend?.();
        }
      }}
      {...props}
    />
  );
});

export function PromptInputFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 px-2 pb-1">{children}</div>;
}

export function PromptInputSubmit({
  status,
  disabled,
}: {
  status: "submitted" | "streaming" | "ready" | "error";
  disabled?: boolean;
}) {
  const busy = status === "submitted" || status === "streaming";
  return (
    <Button type="submit" size="icon" disabled={disabled || busy} className="rounded-full">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
    </Button>
  );
}
