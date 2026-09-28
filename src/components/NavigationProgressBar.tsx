import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * High-performance top-edge navigation progress bar.
 * Provides instant tactile feedback on page/route switches, similar to YouTube / Linear / GitHub.
 */
export function NavigationProgressBar() {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setActive(true);
    setProgress(25);

    const t1 = setTimeout(() => {
      setProgress(75);
    }, 40);

    const t2 = setTimeout(() => {
      setProgress(100);
    }, 150);

    const t3 = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 320);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, location.search]);

  if (!active && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-indigo-500 to-amber-400 shadow-[0_0_10px_rgba(37,99,235,0.8),0_0_5px_rgba(245,158,11,0.7)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 120ms ease-out, opacity 140ms ease-out" : "width 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
