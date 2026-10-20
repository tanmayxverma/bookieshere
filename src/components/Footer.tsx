import { Link } from "react-router-dom";
import { useState } from "react";
import { Send, PlusCircle } from "lucide-react";
import { AdminLoginModal } from "@/components/Admin/AdminLoginModal";
import { BookieEmblem } from "@/components/Brand/BookieEmblem";

export function Footer() {
  const year = new Date().getFullYear();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="w-full relative mt-16 pb-20 md:pb-0">
      {/* Telegram Drop Channel Banner */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="relative bg-card border border-border text-card-foreground rounded-2xl p-6 sm:p-8 overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
          <div className="relative z-10 max-w-3xl flex flex-col items-start gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/60 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              TELEGRAM CHANNEL // ZERO DELAY ARCHIVAL DROPS
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-medium tracking-tight">
              New material drops. Straight to your desk.
            </h2>

            <p className="font-sans text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Be the first to know when we index fresh Kota test series, PYQ video links, Allen milestone modules, and verified notes — no spam, just pure signal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://t.me/bookieshere"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-sans font-medium text-sm shadow-sm hover:bg-primary/90 transition-all select-none active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Join Telegram Channel ↗</span>
              </a>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-sans font-medium text-sm shadow-sm transition-all select-none active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request a Resource ↗</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                24.8K ASPIRANTS ACTIVE
              </span>
              <span>•</span>
              <span>2 ARCHIVAL DROPS / WEEK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Official Multi-Tier Archival Footer */}
      <footer className="w-full bg-card mt-8 border-t border-border shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2.5">
              <BookieEmblem size={26} />
              <span className="font-serif font-bold text-lg text-foreground tracking-tight">BOOKIE®</span>
              <span className="text-[11px] font-mono text-muted-foreground border-l border-border pl-2">ACADEMIC INK</span>
            </div>
            <p className="font-sans text-xs text-muted-foreground text-center md:text-left mt-0.5">
              © {year} Bookie Academic Journal. Engineered for Ambitious Aspirants.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 font-mono text-xs tracking-wider text-muted-foreground font-medium">
              <Link to="/materials" className="hover:text-primary transition-colors">PRACTICE</Link>
              <span>•</span>
              <Link to="/tests" className="hover:text-primary transition-colors">PROGRESS</Link>
              <span>•</span>
              <Link to="/ypt" className="hover:text-primary transition-colors">PERFORM</Link>
              <span>•</span>
              <Link to="/donate" className="hover:text-primary transition-colors">CHAI ☕</Link>
              <span>•</span>
              <Link to="/dmca" className="hover:text-primary transition-colors">DMCA</Link>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AIR TARGET 2027
            </div>
          </div>
        </div>

        {/* Legal & Compliance Sub-Footer */}
        <div className="border-t border-border bg-muted/40 py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-muted-foreground">
                <Link to="/copyright-terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link to="/dmca" className="hover:text-primary transition-colors">
                  DMCA &amp; Copyright
                </Link>
                <span>•</span>
                <Link to="/support" className="hover:text-primary transition-colors">
                  Support Desk
                </Link>
                {/* Secret admin gateway trigger */}
                <button
                  type="button"
                  onClick={() => setAdminOpen(true)}
                  aria-label="Admin gateway"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer select-none px-0.5 focus:outline-none"
                >
                  •
                </button>
              </div>

              <div className="text-muted-foreground text-[11px] font-mono text-center sm:text-right">
                Legal &amp; Verification Enquiries:{' '}
                <Link to="/support" className="font-semibold text-primary hover:underline">
                  Support Desk
                </Link>
              </div>
            </div>

            <p className="text-[11px] font-mono leading-relaxed text-muted-foreground/80 text-center sm:text-left">
              BOOKIE is an educational workspace and study tracker. Google OAuth is used solely for secure sign-in and profile synchronization in adherence to the Google API Services User Data Policy Limited Use requirements. We never sell user data.
            </p>
          </div>
        </div>
      </footer>

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
}
