import { Link } from "react-router-dom";
import { Send, BookOpen, Download } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jfif";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Footer() {
  const [open, setOpen] = useState(false);

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

      {/* Footer Bottom */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="BOOKIE Logo" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-display font-extrabold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent tracking-tight">BOOKIE</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/materials" className="hover:text-foreground transition-colors">
                Materials
              </Link>
              <Link to="/how-to-download" className="hover:text-foreground transition-colors">
                How to Download
              </Link>
              <Link to="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="hover:text-foreground transition-colors">
                    Why shortened links?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display">Why Shortened Links?</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Some users ask why we don't provide direct PDF links.</p>
                    <p>The reason is to support website maintenance and server costs.</p>
                    <p>This platform is run by a student to help other students, and all materials remain completely free.</p>
                    <p className="font-medium text-foreground">No content is locked or paid.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BOOKIE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
