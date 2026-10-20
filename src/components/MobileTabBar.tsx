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
  { path: "/materials", label: "Materials", icon: BookOpen },
  { path: "/tests", label: "Tests", icon: FileText },
  { path: "/ypt", label: "YPT", icon: Timer, badge: "LIVE" },
  { path: "/community", label: "Community", icon: MessageSquare },
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-[var(--desk-border)] shadow-[0px_-3px_0px_var(--desk-border)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-3"
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
                "relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-lg transition-all duration-100 select-none",
                active
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "relative p-1 rounded-md transition-transform active:scale-95",
                  active && "bg-primary/10 border border-primary/30"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-[var(--coral)] text-white text-[9px] font-mono font-black border border-[var(--desk-border)]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono tracking-tight mt-0.5",
                  active ? "font-bold text-foreground" : "font-medium text-muted-foreground"
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
