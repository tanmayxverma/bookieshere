import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.jfif";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/materials", label: "Materials" },
  { path: "/tests", label: "Tests" },
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
          ? "border-b border-primary/15 bg-background/70 shadow-[0_1px_15px_-4px_hsl(var(--primary)/0.12)] h-14"
          : "border-b border-primary/10 bg-background/50 shadow-[0_1px_8px_-3px_hsl(var(--primary)/0.08)] h-16"
      }`}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="BOOKIE Logo" className={`rounded-lg object-cover shadow-md transition-all duration-500 ${scrolled ? "h-8 w-8" : "h-9 w-9"}`} />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">BOOKIE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                )}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-border/30">
              <ThemeToggle />
            </div>
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
