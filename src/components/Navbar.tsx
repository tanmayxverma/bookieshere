import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.jfif";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/materials", label: "Materials" },
  { path: "/tests", label: "Tests" },
  { path: "/ypt", label: "YPT" },
  { path: "/support", label: "Support" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 navbar-glass ${
        scrolled
          ? "border-b border-border/40 bg-background/75 backdrop-saturate-150 shadow-[0_8px_30px_-18px_hsl(var(--primary)/0.25)] h-14"
          : "border-b border-border/20 bg-background/55 h-16"
      }`}
    >
      <div className="container mx-auto px-4 h-full relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-60" />
        <div className="flex h-full items-center justify-between">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative">
              <span className="absolute inset-0 rounded-xl bg-primary/30 blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
              <img src={logo} alt="BOOKIE Logo" className={`relative rounded-xl object-cover ring-1 ring-border/40 shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.3)] transition-all duration-500 ${scrolled ? "h-8 w-8" : "h-9 w-9"}`} />
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-foreground">BOOKIE</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-2/60 border border-border/40 text-[9px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                <Sparkles className="h-2.5 w-2.5 text-primary" /> JEE
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1 rounded-2xl bg-surface-2/40 backdrop-blur border border-border/30 px-1.5 py-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? "text-foreground bg-card/80 shadow-[0_2px_8px_-3px_hsl(var(--primary)/0.25)] ring-1 ring-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.path) && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
              </Link>
            ))}
          </div>
          <div className="hidden md:block ml-3">
            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pop-in border-t border-border/20 mt-1 pt-2">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
