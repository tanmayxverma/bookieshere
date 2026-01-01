import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.jfif";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/materials", label: "Materials" },
  { path: "/how-to-download", label: "How to Download" },
  { path: "/support", label: "Support" },
];

const batches = [
  {
    title: "Arjuna JEE 2026 / 2027",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    link: "https://t.me/arjunajee2027batch",
  },
  {
    title: "Lakshya JEE 2026 / 2027",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    link: "https://t.me/lakshayajee2027",
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [batchesOpen, setBatchesOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BOOKIE Logo" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-display text-xl font-extrabold text-foreground tracking-tight">BOOKIE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Batches Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  Batches
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-80 p-4 bg-popover border border-border shadow-lg z-50"
              >
                <div className="space-y-4">
                  {batches.map((batch, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-display font-semibold text-foreground text-sm">
                        {batch.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Includes: {batch.includes.join(" • ")}
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="w-full gap-2"
                      >
                        <a 
                          href={batch.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Watch Lectures
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    External batches hosted on Telegram. BOOKIE does not host video lectures or tests.
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Batches Accordion */}
              <button
                onClick={() => setBatchesOpen(!batchesOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Batches
                <ChevronDown className={`h-4 w-4 transition-transform ${batchesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {batchesOpen && (
                <div className="ml-4 space-y-3 py-2 border-l-2 border-border pl-4">
                  {batches.map((batch, index) => (
                    <div key={index} className="space-y-1">
                      <h3 className="font-display font-semibold text-foreground text-sm">
                        {batch.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {batch.includes.join(" • ")}
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="gap-2 mt-1"
                      >
                        <a 
                          href={batch.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Watch Lectures
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    External batches hosted on Telegram. BOOKIE does not host video lectures or tests.
                  </p>
                </div>
              )}

              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
