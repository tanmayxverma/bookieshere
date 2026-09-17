import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, FileText, Timer, LayoutGrid, MessageSquare, Headphones,
  Menu, X, LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/Profile/UserMenu";
import { NotificationBell } from "@/components/Notifications/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useUserStreak";
import logo from "@/assets/logo.jfif";
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

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "A";
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAuthenticated, user, signOut, googleAvatar } = useProfile();
  const { streak } = useUserStreak();

  const displayName = profile?.display_name || (isAuthenticated ? (user?.email?.split("@")[0] || "Aspirant") : "Guest");
  const avatarInitial = initials(displayName);
  const avatarUrl = profile?.avatar_url || (isAuthenticated ? googleAvatar : null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Close menu on location change or Escape key
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-2 sm:top-4 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" data-purpose="floating-navigation">
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 group min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner group-hover:scale-105 transition-transform shrink-0 border border-slate-200/80 dark:border-slate-700 bg-white flex items-center justify-center">
              <img
                src={logo}
                alt="BOOKIE Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-baseline shrink-0">
              <span className="font-display font-black text-2xl tracking-tighter text-brand-dark dark:text-white group-hover:text-brand-blue transition-colors">
                BOOKIE
              </span>
              <span className="text-brand-blue font-bold text-xs ml-0.5">®</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links with matching Symbols */}
        <div className="hidden lg:flex items-center gap-1 text-sm font-semibold font-sans">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 text-xs xl:text-sm",
                  active
                    ? "bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-bold shadow-xs"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-brand-blue dark:text-blue-400" : "text-slate-500 dark:text-slate-400")} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1 py-0.2 rounded font-mono font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Actions & Mobile Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Chai Break Button */}
          <Link
            to="/donate"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all"
          >
            <span>☕</span>
            <span>Chai</span>
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop User Profile Pill: Hidden on mobile taskbar, visible on desktop */}
          <div className="hidden lg:flex items-center pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" data-purpose="user-pill">
            <UserMenu compact={true} />
          </div>

          {/* Mobile Menu (Three Lines) Toggle Button: Forced on mobile taskbar instead of user button */}
          <button
            type="button"
            className="flex lg:hidden items-center justify-center h-9 w-9 p-2 rounded-full text-slate-700 dark:text-slate-200 hover:text-brand-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="lg:hidden mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Profile Card on Mobile */}
          <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <Link
              to={isAuthenticated ? (profile ? "/profile" : "/onboarding") : "/welcome"}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900 overflow-hidden shadow-xs">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <span>{avatarInitial}</span>
                  )}
                </div>
                <span
                  title={`Active study streak: ${streak} day${streak === 1 ? '' : 's'}`}
                  className="text-[9px] font-mono font-extrabold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/90 px-1 py-0 rounded-full border border-amber-300/80 dark:border-amber-700 leading-tight absolute -bottom-1 -right-1 shadow-xs whitespace-nowrap"
                >
                  🔥 {streak}d
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-blue transition-colors">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {profile ? (profile.target_category || "JEE 2027") : (isAuthenticated ? "Complete Profile" : "Guest · Tap to Sign In")}
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  title="Sign Out"
                  onClick={async () => {
                    setIsOpen(false);
                    await signOut();
                    navigate("/welcome");
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  to="/welcome"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-blue-50 dark:bg-blue-950 text-brand-blue font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", active ? "text-brand-blue" : "text-slate-500")} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              to="/donate"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 mt-1"
            >
              <span>☕</span>
              <span>Chai Break</span>
            </Link>
          </div>
        </div>
      )}
      </header>
    </>
  );
}
