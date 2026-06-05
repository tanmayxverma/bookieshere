import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Library, ClipboardList, Timer, LifeBuoy, Coffee, AppWindow } from "lucide-react";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/Profile/UserMenu";
import logo from "@/assets/logo.jfif";

const navLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/materials", label: "Materials", icon: Library },
  { path: "/tests", label: "Tests", icon: ClipboardList },
  { path: "/ypt", label: "YPT", icon: Timer },
  { path: "/portals", label: "Portals", icon: AppWindow },
  { path: "/support", label: "Support", icon: LifeBuoy },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Sliding active indicator
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0, width: 0, visible: false,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  useLayoutEffect(() => {
    const active = navLinks.find((l) => isActive(l.path));
    if (!active || !navRef.current) {
      setIndicator((s) => ({ ...s, visible: false }));
      return;
    }
    const el = linkRefs.current[active.path];
    const parent = navRef.current.getBoundingClientRect();
    if (el) {
      const r = el.getBoundingClientRect();
      setIndicator({ left: r.left - parent.left, width: r.width, visible: true });
    }
  }, [location.pathname, scrolled]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 navbar-glass ${
        scrolled ? "py-2" : "py-3.5"
      }`}
    >
      {/* Backdrop layer - subtle, never heavy */}
      <div
        aria-hidden
        className={`absolute inset-0 transition-all duration-500 ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-b border-border/40"
            : "bg-transparent border-b border-transparent"
        }`}
      />
      {/* Top accent line */}
      <div aria-hidden className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="relative">
              <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src={logo}
                alt="BOOKIE Logo"
                className={`relative rounded-xl object-cover ring-1 ring-border/50 shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.4)] transition-all duration-500 ${
                  scrolled ? "h-8 w-8" : "h-9 w-9"
                }`}
              />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground leading-none">
              BOOKIE<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation — floating glass capsule with sliding indicator */}
          <div
            ref={navRef}
            className="hidden md:flex relative items-center gap-1 rounded-full border border-border/50 bg-background/60 backdrop-blur-xl backdrop-saturate-150 px-2 py-1.5 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.25),inset_0_1px_0_hsl(var(--background)/0.4)]"
          >
            {/* Sliding indicator */}
            <span
              aria-hidden
              className={`pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/30 shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5),inset_0_1px_0_hsl(var(--primary)/0.3)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                indicator.visible ? "opacity-100" : "opacity-0"
              }`}
              style={{ left: indicator.left, width: indicator.width }}
            />

            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  ref={(el) => (linkRefs.current[link.path] = el)}
                  to={link.path}
                  className={`relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium tracking-tight transition-colors duration-300 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-all duration-300 ${active ? "text-primary" : "text-muted-foreground/70"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              to="/donate"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-background/60 backdrop-blur-xl text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all"
            >
              <Coffee className="h-3.5 w-3.5 text-primary group-hover:rotate-[-8deg] transition-transform duration-500" />
              Chai
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <UserMenu compact />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/50 bg-background/60 backdrop-blur-xl"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-3 pop-in rounded-2xl border border-border/50 bg-background/85 backdrop-blur-xl p-2 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.3)]">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-foreground border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2/60 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground/70"}`} />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/30 mt-1"
              >
                <Coffee className="h-4 w-4 text-primary" />
                Buy me a Chai
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
