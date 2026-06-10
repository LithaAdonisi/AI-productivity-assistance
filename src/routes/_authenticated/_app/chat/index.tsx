import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { createThread, readThreads, upsertThread } from "@/lib/chat-threads";

export const Route = createFileRoute("/_authenticated/_app/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const existing = readThreads();
    if (existing[0]) {
      navigate({ to: "/chat/$threadId", params: { threadId: existing[0].id }, replace: true });
    } else {
      const t = createThread();
      upsertThread(t);
      navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      <MessageCircle className="mr-2 h-5 w-5" /> Loading conversation…
    </div>
  );
}
