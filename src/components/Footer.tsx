import { Link } from "react-router-dom";
import { Send, BookOpen } from "lucide-react";
import logo from "@/assets/logo.jfif";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      {/* Stay Updated Section - Integrated into Footer */}
      <div className="py-12 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Stay <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Updated</span> with New Materials
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              
              <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-card">
                <Link to="/materials">
                  <BookOpen className="h-5 w-5" />
                  Browse Materials
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="BOOKIE Logo" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-display font-extrabold text-foreground tracking-tight">BOOKIE</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
              <Link to="/materials" className="text-muted-foreground hover:text-foreground transition-colors">
                Materials
              </Link>
              <Link to="/batches" className="text-muted-foreground hover:text-foreground transition-colors">
                Batches
              </Link>
              <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
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