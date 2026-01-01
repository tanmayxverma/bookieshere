import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jfif";
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
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="BOOKIE Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display font-extrabold text-foreground tracking-tight">BOOKIE</span>
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

          {/* Telegram as subtle text link */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Send className="h-4 w-4" />
            <span>Stay updated:</span>
            <a
              href="https://t.me/bookieshere"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Telegram Channel
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BOOKIE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}