import { useEffect, useState, useCallback } from "react";

const KEY = "wpai.theme";
export type Theme = "light" | "dark";

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

function readInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const t = readInitial();
    setThemeState(t);
    applyTheme(t);
    const onChange = () => {
      const next = (localStorage.getItem(KEY) as Theme) || "dark";
      setThemeState(next);
      applyTheme(next);
    };
    window.addEventListener("wpai:theme", onChange);
    return () => window.removeEventListener("wpai:theme", onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(KEY, t);
    applyTheme(t);
    setThemeState(t);
    window.dispatchEvent(new Event("wpai:theme"));
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
