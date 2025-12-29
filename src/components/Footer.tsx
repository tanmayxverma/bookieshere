import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">BOOKIE</span>
          </div>
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
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BOOKIE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}