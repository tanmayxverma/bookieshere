import { Link } from "react-router-dom";
import { Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jfif";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="BOOKIE Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display font-semibold text-foreground">BOOKIE</span>
          </div>

          {/* Official Telegram Channel */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Join our Official Telegram Channel</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open("https://t.me/bookieshere", "_blank", "noopener,noreferrer")}
            >
              <Send className="h-4 w-4" />
              BOOKIE Official Telegram
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/materials" className="hover:text-foreground transition-colors">
              Materials
            </Link>
            <Link to="/how-to-download" className="hover:text-foreground transition-colors">
              How to Download
            </Link>
            <Link to="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BOOKIE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
