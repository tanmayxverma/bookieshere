import { Link } from "react-router-dom";
import { Send, BookOpen } from "lucide-react";
import logo from "@/assets/logo.jfif";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-surface-1">
      {/* Stay Updated Section */}
      <div className="py-14 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {/* Pill */}
            <span className="pill pill-primary">
              <Send className="h-3 w-3" />
              Stay Connected
            </span>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Stay <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Updated</span> with New Materials
            </h2>
            
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Join our Telegram channel to get notified when new resources are added.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button 
                asChild 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-[#0088cc] to-[#0066aa] hover:from-[#0088cc]/90 hover:to-[#0066aa]/90 text-white shadow-lg shadow-[#0088cc]/25"
              >
                <a 
                  href="https://t.me/bookieshere" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Send className="h-5 w-5" />
                  Join Telegram Channel
                </a>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-surface-2">
                <Link to="/materials">
                  <BookOpen className="h-5 w-5" />
                  Browse Materials
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="py-10 bg-surface-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="BOOKIE Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
              <span className="font-display font-extrabold text-foreground tracking-tight">BOOKIE</span>
            </div>

            {/* Divider dot */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-border/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="w-8 h-px bg-border/50" />
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
              <Link to="/materials" className="text-muted-foreground hover:text-foreground transition-colors">
                Materials
              </Link>
              <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </nav>

            {/* Legal Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
              <Link to="/copyright-terms" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                Copyright & Terms
              </Link>
              <span className="text-border">·</span>
              <Link to="/dmca" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                DMCA
              </Link>
              <span className="text-border">·</span>
              <Link to="/privacy-policy" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span className="text-border">·</span>
              <a 
                href="https://t.me/tellurdemandsbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} BOOKIE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
