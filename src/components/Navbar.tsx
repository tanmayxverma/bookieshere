import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, FileText, Timer, LayoutGrid, MessageSquare, Headphones,
  Menu, X, Sparkles, User, ShieldCheck, LogOut
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/Profile/UserMenu";
import { NotificationBell } from "@/components/Notifications/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import { UpgradeModal } from "@/components/Auth/UpgradeModal";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navLinks: NavLinkItem[] = [
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
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAuthenticated, user, signOut, googleAvatar } = useProfile();
  const { streak } = useUserStreak();

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : null) || (isAuthenticated ? "Aspirant" : "Guest Aspirant");
  const avatarUrl = profile?.avatar_url || googleAvatar || null;
  const accountBadge = profile?.account_type === "guest" || !isAuthenticated ? "Guest" : profile?.account_type === "google" ? "Google" : "Email";
  const targetCategory = profile?.target_category || "JEE 2027";
  const streakCount = typeof streak === "number" && !isNaN(streak) ? streak : 0;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    navigate("/welcome", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-2.5 sm:px-8 max-w-7xl mx-auto w-full" data-purpose="floating-navigation">
      <nav className="bg-card border-2 border-[var(--desk-border)] rounded-2xl sm:rounded-full px-3 sm:px-5 py-2 shadow-[3px_3px_0px_var(--desk-border)] flex items-center justify-between transition-all">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[var(--desk-border)] bg-white flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_var(--desk-border)] group-hover:scale-105 transition-transform">
              <img
                src={logo}
                alt="BOOKIE Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            </div>
            <div className="flex items-baseline">
              <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-foreground transition-colors">
                BOOKIE
              </span>
              <span className="text-primary font-bold text-xs ml-0.5">®</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold font-body">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg border-2 transition-all duration-100 flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5",
                  active
                    ? "bg-primary text-primary-foreground border-[var(--desk-border)] shadow-[1.5px_1.5px_0px_var(--desk-border)] font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted font-semibold"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-[var(--coral)] text-white px-1.5 py-0.2 rounded font-mono font-black border border-[var(--desk-border)]">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Actions & Compact Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Chai Break Button */}
          <Link
            to="/donate"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[var(--sunflower)] text-[#0F172A] border-2 border-[var(--desk-border)] shadow-[2px_2px_0px_var(--desk-border)] hover:brightness-105 transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span>☕</span>
            <span>Chai</span>
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Compact User Profile Pill */}
          <div className="flex items-center pl-1 sm:pl-2 border-l-2 border-[var(--desk-border)]" data-purpose="user-pill">
            <UserMenu compact={true} />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="p-2 text-foreground rounded-lg border-2 border-[var(--desk-border)] bg-muted/50 hover:bg-muted lg:hidden transition-all h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5 shrink-0 shadow-[2px_2px_0px_var(--desk-border)]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Backdrop Overlay + Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for easy outside tap dismissal */}
          <div
            className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Navigation Dropdown */}
          <div className="relative z-50 lg:hidden mt-2 rounded-2xl border-2 border-[var(--desk-border)] bg-card text-foreground p-3 shadow-[4px_4px_0px_var(--desk-border)] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
            {/* Mobile Profile Header Card */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="p-3 mb-2 rounded-xl bg-muted/40 hover:bg-muted border-2 border-[var(--desk-border)] shadow-[2px_2px_0px_var(--desk-border)] flex items-center justify-between gap-3 group transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm flex items-center justify-center border-2 border-[var(--desk-border)] overflow-hidden shrink-0 shadow-[1px_1px_0px_var(--desk-border)]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials(displayName)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground truncate transition-colors">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded border border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] uppercase shrink-0">
                      {accountBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                    {targetCategory} · {streakCount}d streak
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg border-2 border-[var(--desk-border)] bg-primary text-primary-foreground font-bold text-xs shadow-[1.5px_1.5px_0px_var(--desk-border)] transition-all shrink-0">
                Stats →
              </span>
            </Link>

            {/* Mobile Account Buttons */}
            <div className="flex items-center gap-2 mb-2">
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setUpgradeOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border-2 border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] font-bold text-xs shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-lg border-2 border-[var(--desk-border)] bg-destructive text-destructive-foreground font-bold text-xs shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 border-[var(--desk-border)] bg-destructive text-destructive-foreground font-bold text-xs shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1 border-t border-slate-200/80 dark:border-slate-800 pt-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] min-h-[48px]",
                      active
                        ? "bg-blue-50 dark:bg-blue-950/70 text-brand-blue dark:text-blue-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4", active ? "text-brand-blue dark:text-blue-400" : "text-slate-500 dark:text-slate-400")} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 mt-1 active:scale-[0.98] transition-all duration-150 min-h-[48px]"
              >
                <span>☕</span>
                <span>Buy Me a Chai ❤️</span>
              </Link>
            </div>
          </div>
        </>
      )}
      <UpgradeModal
        isOpen={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        feature="general"
      />
    </header>
  );
}
