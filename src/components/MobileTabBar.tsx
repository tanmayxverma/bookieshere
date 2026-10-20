import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, FileText, Timer, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const tabs: TabItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/materials", label: "Vault", icon: BookOpen },
  { path: "/ypt", label: "Timer", icon: Timer, badge: "LIVE" },
  { path: "/tests", label: "Tests", icon: FileText },
  { path: "/community", label: "Codex", icon: MessageSquare },
];

export function MobileTabBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-3 transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all duration-150 select-none active:scale-95",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "relative p-1 rounded-lg transition-colors",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[8px] font-mono font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-sans tracking-tight mt-0.5",
                  active ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
