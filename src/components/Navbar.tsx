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
          ? "h-14 bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border/40 shadow-[0_1px_0_0_hsl(var(--border)/0.4),0_8px_30px_-20px_hsl(var(--primary)/0.3)]"
          : "h-16 bg-background/40 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="relative">
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src={logo}
                alt="BOOKIE Logo"
                className={`relative rounded-xl object-cover ring-1 ring-border/50 transition-all duration-500 ${
                  scrolled ? "h-8 w-8" : "h-9 w-9"
                }`}
              />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              BOOKIE
              <span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation — minimal underline style */}
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative py-1.5 text-sm font-medium tracking-tight transition-colors duration-200 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 mx-auto h-px bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-300 ${
                      active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-2/3 group-hover:opacity-60"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
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
