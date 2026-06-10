import { useEffect, useState } from "react";
import { emptyStats, readHistory, readStats, type HistoryItem, type UsageStats } from "@/lib/usage-stats";

export function useUsageStats(): UsageStats {
  const [stats, setStats] = useState<UsageStats>(emptyStats);
  useEffect(() => {
    const sync = () => setStats(readStats());
    sync();
    window.addEventListener("wpai:stats", sync);
    return () => window.removeEventListener("wpai:stats", sync);
  }, []);
  return stats;
}

export function useHistory(): HistoryItem[] {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(readHistory());
    sync();
    window.addEventListener("wpai:history", sync);
    return () => window.removeEventListener("wpai:history", sync);
  }, []);
  return items;
}
