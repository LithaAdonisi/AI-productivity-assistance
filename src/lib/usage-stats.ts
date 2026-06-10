export type StatKind = "email" | "meeting" | "task" | "research" | "chat";

export type UsageStats = Record<StatKind, number>;

export type HistoryItem = {
  id: string;
  kind: Exclude<StatKind, "chat">;
  title: string;
  content: string;
  createdAt: number;
};

const STATS_KEY = "wpai.stats.v1";
const HISTORY_KEY = "wpai.history.v1";
const HISTORY_CAP = 50;

export const emptyStats: UsageStats = {
  email: 0,
  meeting: 0,
  task: 0,
  research: 0,
  chat: 0,
};

export function readStats(): UsageStats {
  if (typeof window === "undefined") return emptyStats;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats;
    return { ...emptyStats, ...JSON.parse(raw) };
  } catch {
    return emptyStats;
  }
}

export function bumpStat(kind: StatKind) {
  if (typeof window === "undefined") return;
  const s = readStats();
  s[kind] = (s[kind] || 0) + 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("wpai:stats"));
}

export function clearStats() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STATS_KEY);
  window.dispatchEvent(new Event("wpai:stats"));
}

export function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export function saveAiHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const list = readHistory();
  const next: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const updated = [next, ...list].slice(0, HISTORY_CAP);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("wpai:history"));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event("wpai:history"));
}
