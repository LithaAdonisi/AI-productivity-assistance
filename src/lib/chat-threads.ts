import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "wpai.chat.threads.v1";

export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatThread[];
  } catch {
    return [];
  }
}

export function writeThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("wpai:threads"));
}

export function createThread(): ChatThread {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    updatedAt: Date.now(),
    messages: [],
  };
}

export function upsertThread(thread: ChatThread) {
  const list = readThreads();
  const idx = list.findIndex((t) => t.id === thread.id);
  if (idx >= 0) list[idx] = thread;
  else list.unshift(thread);
  list.sort((a, b) => b.updatedAt - a.updatedAt);
  writeThreads(list);
}

export function deleteThread(id: string) {
  writeThreads(readThreads().filter((t) => t.id !== id));
}

export function clearThreads() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("wpai:threads"));
}

export function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "New conversation";
  return text.length > 45 ? text.slice(0, 45) + "…" : text;
}
