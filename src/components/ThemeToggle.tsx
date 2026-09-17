import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDark(root.classList.contains("dark"));
    };

    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }

    window.addEventListener("theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const willBeDark = !root.classList.contains("dark");
    if (willBeDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(willBeDark);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: willBeDark } }));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 text-slate-500 hover:text-brand-dark dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors h-9 w-9 flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700 ${className ?? ""}`}
      aria-label="Toggle theme"
      type="button"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={`h-4 w-4 transition-all duration-300 ${isDark ? "hidden" : "block text-amber-500 hover:rotate-45"}`} />
      <Moon className={`h-4 w-4 transition-all duration-300 ${isDark ? "block text-blue-400 hover:-rotate-12" : "hidden"}`} />
    </button>
  );
}