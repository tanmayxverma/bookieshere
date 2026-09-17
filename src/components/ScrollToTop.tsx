import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function scrollToTop() {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in window.history) {
    try {
      window.history.scrollRestoration = "manual";
    } catch {}
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const scrollables = document.querySelectorAll<HTMLElement>("main, #root, #root > div, [data-scroll-container]");
  scrollables.forEach((el) => {
    if (el.scrollTop > 0) el.scrollTop = 0;
  });
}

export function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  // Scroll to top on every route, path, search or hash change
  useEffect(() => {
    scrollToTop();

    // Re-verify in next frame to prevent race conditions with layout rendering
    const rafId = requestAnimationFrame(scrollToTop);
    const timer = setTimeout(scrollToTop, 40);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [location.pathname, location.search, location.hash, location.key, navType]);

  // Global click interception: if user clicks any link or button that redirects / navigates
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button");
      if (!target) return;

      const href = target.getAttribute("href");
      const isInternalLink = !!href && (href.startsWith("/") || href.startsWith("#") || href === window.location.pathname);
      const isButtonNav = target.getAttribute("role") === "link" || target.getAttribute("data-navigate") === "true";

      if (isInternalLink || isButtonNav) {
        // Immediate and subsequent frame scroll
        scrollToTop();
        setTimeout(scrollToTop, 20);
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => window.removeEventListener("click", handleGlobalClick, { capture: true });
  }, []);

  return null;
}
