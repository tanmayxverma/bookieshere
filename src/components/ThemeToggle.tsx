import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { BookieLoader } from "@/components/BookieLoader";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [nextThemeName, setNextThemeName] = useState<"dark" | "light">("dark");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
      setIsDark(true);
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const toggleTheme = () => {
    if (isTransitioning) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const willBeDark = !isDark;
    setNextThemeName(willBeDark ? "dark" : "light");
    setIsTransitioning(true);
    setIsFading(false);

    // 1. Give the browser a moment to render the loader overlay
    const t1 = setTimeout(() => {
      const root = document.documentElement;
      if (willBeDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setIsDark(true);
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
        setIsDark(false);
      }
    }, 60);

    // 2. Start fading out loader once the new theme is applied cleanly
    const t2 = setTimeout(() => {
      setIsFading(true);
    }, 420);

    // 3. Remove overlay from DOM once fade completes
    const t3 = setTimeout(() => {
      setIsTransitioning(false);
      setIsFading(false);
    }, 640);

    timersRef.current.push(t1, t2, t3);
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="p-2 text-slate-500 hover:text-brand-dark dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors h-9 w-9 flex items-center justify-center cursor-pointer"
        aria-label="Toggle theme"
        type="button"
      >
        <Sun className={`h-4 w-4 transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0 hidden' : 'rotate-0 scale-100 opacity-100'}`} />
        <Moon className={`h-4 w-4 transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 hidden'}`} />
      </button>

      {/* Brief Bookie Loader on Theme Switch to eliminate half-themed flicker */}
      {isTransitioning && typeof document !== "undefined" && createPortal(
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-200 pointer-events-none ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        >
          <BookieLoader
            label={nextThemeName === "dark" ? "Switching to Dark Mode" : "Switching to Light Mode"}
            fullscreen={true}
          />
        </div>,
        document.body
      )}
    </>
  );
}