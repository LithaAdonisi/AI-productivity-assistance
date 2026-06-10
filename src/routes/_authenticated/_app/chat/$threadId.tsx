import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Conversation } from "@/components/ai-elements/conversation";
import { MessageFromUI } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  deriveTitle,
  readThreads,
  upsertThread,
  type ChatThread,
} from "@/lib/chat-threads";
import { bumpStat } from "@/lib/usage-stats";

export const Route = createFileRoute("/_authenticated/_app/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const initial = useMemo<ChatThread | null>(() => {
    const list = readThreads();
    return list.find((t) => t.id === threadId) ?? null;
  }, [threadId]);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initial?.messages ?? [],
    transport,
    onError: (e) => toast.error(e.message),
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId]);

  // Persist on changes
  useEffect(() => {
    if (!messages.length) return;
    const list = readThreads();
    const existing = list.find((t) => t.id === threadId);
    const thread: ChatThread = {
      id: threadId,
      title: deriveTitle(messages),
      updatedAt: Date.now(),
      messages,
      ...(existing && { title: deriveTitle(messages) }),
    };
    upsertThread(thread);
  }, [messages, threadId]);

  useEffect(() => {
    if (status === "ready" && messages.some((m) => m.role === "assistant")) {
      // no-op; just keep effect dependency stable
    }
  }, [status, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    setInput("");
    try {
      await sendMessage({ text });
      bumpStat("chat");
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Conversation>
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ask the assistant anything – drafting, planning, summarizing, or research.
          </div>
        )}
        {messages.map((m) => (
          <MessageFromUI key={m.id} message={m} />
        ))}
        {status === "submitted" && (
          <div className="flex justify-start">
            <Shimmer>Thinking…</Shimmer>
          </div>
        )}
        {error && (
          <p className="text-xs text-destructive">{error.message}</p>
        )}
      </Conversation>
      <div className="border-t bg-background/60 p-3 backdrop-blur-md">
        <PromptInput onSubmit={handleSend}>
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message the assistant…"
            onSend={handleSend}
          />
          <PromptInputFooter>
            <PromptInputSubmit status={status} disabled={!input.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
