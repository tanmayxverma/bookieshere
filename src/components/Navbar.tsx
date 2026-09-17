import { Link, useLocation } from "react-router-dom";
import {
  Home, BookOpen, FileText, Timer, LayoutGrid, MessageSquare, Headphones,
  Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/Profile/UserMenu";
import { NotificationBell } from "@/components/Notifications/NotificationBell";
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
        
        {/* Brand Logo (JEE 2027 Cockpit badge removed as requested) */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner group-hover:scale-105 transition-transform shrink-0 border border-slate-200/80 dark:border-slate-700 bg-white flex items-center justify-center">
              <img
                src={logo}
                alt="BOOKIE Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-baseline">
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

        {/* User Actions & Compact Profile */}
        <div className="flex items-center gap-2">
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

          {/* Compact User Profile Pill: Just User Icon with Streak badge underneath */}
          <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" data-purpose="user-pill">
            <UserMenu compact={true} />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-brand-dark dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors h-9 w-9 flex items-center justify-center cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="lg:hidden mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
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
