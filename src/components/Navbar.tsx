import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, FileText, Timer, LayoutGrid, MessageSquare, Headphones,
  Menu, X
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/Profile/UserMenu";
import { NotificationBell } from "@/components/Notifications/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import { BookieEmblem } from "@/components/Brand/BookieEmblem";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const primaryNavLinks: NavLinkItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/materials", label: "Materials", icon: BookOpen },
  { path: "/tests", label: "Tests", icon: FileText },
  { path: "/ypt", label: "YPT", icon: Timer, badge: "LIVE" },
  { path: "/portals", label: "Portals", icon: LayoutGrid },
  { path: "/community", label: "Community", icon: MessageSquare },
  { path: "/support", label: "Support", icon: Headphones },
];

function initials(name?: string | null): string {
  if (!name || typeof name !== "string") return "A";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAuthenticated, user, signOut, googleAvatar } = useProfile();
  const { streak } = useUserStreak();

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : null) || (isAuthenticated ? "Aspirant" : "Guest Aspirant");
  const avatarUrl = profile?.avatar_url || googleAvatar || null;
  const accountBadge = profile?.account_type === "guest" || !isAuthenticated ? "Guest" : profile?.account_type === "google" ? "Google" : "Email";
  const targetCategory = profile?.target_category || "JEE 2027 TARGET";
  const streakCount = typeof streak === "number" && !isNaN(streak) ? streak : 0;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-3 sm:px-6 max-w-5xl mx-auto w-full transition-all" data-purpose="floating-navigation">
      <nav className="rounded-full border border-border/80 bg-card/95 backdrop-blur-md px-3.5 sm:px-5 py-2 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-between transition-all">
        
        {/* Brand Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <BookieEmblem size={30} className="shrink-0 transition-transform group-hover:scale-105" />
            <div className="flex items-baseline">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-foreground">
                BOOKIE
              </span>
              <span className="text-primary font-bold text-[10px] ml-0.5">®</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Link Pills */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-medium font-sans">
          {primaryNavLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 select-none active:scale-95",
                  active
                    ? "bg-muted text-foreground border border-border font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", active ? "text-primary" : "text-muted-foreground")} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Utilities Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Chai Patronage Badge */}
          <Link
            to="/donate"
            className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all select-none active:scale-95"
            title="Buy Us a Chai"
          >
            <span>☕</span>
            <span className="hidden sm:inline">Chai</span>
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Midnight Streak Pill */}
          <Link
            to="/profile"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#0F172A] dark:bg-slate-800 text-white shadow-xs hover:bg-[#1E293B] transition-all select-none active:scale-95"
            title="Candidate Daily Streak"
          >
            <span>0 / 🔥 {streakCount}d</span>
          </Link>

          {/* User Menu Trigger */}
          <div className="flex items-center pl-1 border-l border-border/80" data-purpose="user-pill">
            <UserMenu compact={true} />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="p-1.5 text-foreground rounded-full border border-border bg-card hover:bg-muted lg:hidden transition-all h-9 w-9 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Candidate Status Tracking Sub-Bar */}
      <div className="hidden sm:flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-4 py-1 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-primary font-semibold">§ 01 // WELCOME BACK, {displayName}</span>
          <span className="text-neutral-400">•</span>
          <span>{targetCategory}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>CBT ENGINE V4.81 — LIVE CALIBRATION ACTIVE // LATENCY: 12MS</span>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-50 lg:hidden mt-2 rounded-2xl border border-border bg-card text-foreground p-3.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
            {/* Mobile Profile Card */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="p-3 mb-2 rounded-xl bg-muted/50 hover:bg-muted border border-border flex items-center justify-between gap-3 group transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-mono font-bold text-xs flex items-center justify-center border border-border overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials(displayName)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-border bg-muted uppercase shrink-0">
                      {accountBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                    {targetCategory} · {streakCount}d streak
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg border border-border bg-card text-foreground font-medium text-xs">
                Dossier ↗
              </span>
            </Link>

            {/* Mobile Nav Links List */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {primaryNavLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
