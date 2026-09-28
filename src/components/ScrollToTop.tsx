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
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
