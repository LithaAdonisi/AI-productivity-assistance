import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createThread,
  deleteThread,
  readThreads,
  upsertThread,
  type ChatThread,
} from "@/lib/chat-threads";

export const Route = createFileRoute("/_authenticated/_app/chat")({
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    const sync = () => setThreads(readThreads());
    sync();
    window.addEventListener("wpai:threads", sync);
    return () => window.removeEventListener("wpai:threads", sync);
  }, []);

  const handleNew = () => {
    const t = createThread();
    upsertThread(t);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    deleteThread(id);
    if (params.threadId === id) {
      const remaining = readThreads();
      if (remaining[0]) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
      } else {
        navigate({ to: "/chat" });
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-72 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Conversations</h2>
          <Button size="sm" variant="ghost" onClick={handleNew}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {threads.length === 0 ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">
              No conversations yet. Start a new one.
            </p>
          ) : (
            <ul className="space-y-1">
              {threads.map((t) => {
                const active = params.threadId === t.id;
                return (
                  <li key={t.id} className="group relative">
                    <Link
                      to="/chat/$threadId"
                      params={{ threadId: t.id }}
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent",
                        active && "bg-accent",
                      )}
                    >
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{t.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDistanceToNow(t.updatedAt, { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(t.id);
                      }}
                      className="absolute right-2 top-2 hidden rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:block"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
