import { Link } from "react-router-dom";
import { useState } from "react";
import { Send, PlusCircle } from "lucide-react";
import { AdminLoginModal } from "@/components/Admin/AdminLoginModal";
import logo from "@/assets/logo.png";

export function Footer() {
  const year = new Date().getFullYear();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="w-full relative mt-16 pb-16 md:pb-0">
      {/* Telegram Drop Channel CTA Card */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="relative bg-card border-2 border-[var(--desk-border)] text-card-foreground rounded-2xl p-6 sm:p-10 overflow-hidden shadow-[6px_6px_0px_var(--desk-border)]">
          {/* Playful washi tape on top edge */}
          <div className="washi-tape bg-[var(--sunflower)] text-[#0F172A] -rotate-1">
            TELEGRAM CHANNEL // ZERO DELAY
          </div>
          
          <div className="relative z-10 max-w-3xl flex flex-col items-start gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[var(--desk-border)] bg-muted/60 font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              <span className="w-2 h-2 rounded-full bg-[var(--mint)] animate-pulse"></span>
              INSTANT DROPS
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-foreground font-extrabold tracking-tight">
              New material drops. Straight to your feed.
            </h2>

            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Be the first to know when we index fresh Kota test series, PYQ video links, Allen milestone modules, and verified notes — no spam, just pure signal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://t.me/bookieshere"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-[var(--desk-border)] bg-primary text-primary-foreground font-body font-bold text-sm uppercase tracking-wide shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all hover:brightness-105 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Join Telegram Channel ↗</span>
              </a>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-[var(--desk-border)] bg-muted/50 hover:bg-muted text-foreground font-body font-bold text-sm uppercase tracking-wide shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request a Resource ↗</span>
              </Link>
            </div>

            {/* Mini Channel Metrics */}
            <div className="flex items-center gap-3 mt-2 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)]"></span>
                24.8K ASPIRANTS ACTIVE
              </span>
              <span>•</span>
              <span>2 DROPS / WEEK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="w-full bg-card mt-12 border-t-2 border-[var(--desk-border)] shadow-[0px_-2px_0px_var(--desk-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Bookie"
                className="w-7 h-7 rounded-lg object-cover border-2 border-[var(--desk-border)] shadow-[1px_1px_0px_var(--desk-border)]"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
              <span className="font-heading font-extrabold text-lg text-foreground tracking-tight">BOOKIE®</span>
            </div>
            <p className="font-body text-xs text-muted-foreground text-center md:text-left">
              © {year} Bookie Academics. Engineered for Ambitious Aspirants.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 font-mono text-xs tracking-wider text-muted-foreground font-semibold">
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
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border-2 border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] font-bold shadow-[1.5px_1.5px_0px_var(--desk-border)]">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              AIR TARGET 2027
            </div>
          </div>
        </div>

        {/* Legal & Verification Sub-Footer (Restored) */}
        <div className="border-t border-outline-variant/15 dark:border-slate-800 bg-surface-container-lowest/60 dark:bg-slate-900/40 py-4 mt-space-md">
          <div className="max-w-7xl mx-auto px-margin lg:px-margin-desktop space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-on-surface">
                <Link to="/copyright-terms" className="font-bold underline hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <span className="text-outline-variant">•</span>
                <Link to="/privacy-policy" className="font-bold underline hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-outline-variant">•</span>
                <Link to="/dmca" className="text-on-surface-variant hover:text-primary transition-colors">
                  DMCA &amp; Copyright
                </Link>
                <span className="text-outline-variant">•</span>
                <Link to="/support" className="text-on-surface-variant hover:text-primary transition-colors">
                  Support Desk
                </Link>
                {/* Secret admin gateway dot, styled identically to all other separator dots */}
                <button
                  type="button"
                  onClick={() => setAdminOpen(true)}
                  aria-label="•"
                  className="text-outline-variant hover:text-primary transition-colors cursor-pointer select-none px-0.5 focus:outline-none"
                >
                  •
                </button>
              </div>

              <div className="text-on-surface-variant text-[11px] font-mono text-center sm:text-right">
                Legal &amp; Verification Enquiries:{' '}
                <Link to="/support" className="font-bold text-primary hover:underline">
                  Support Desk
                </Link>
              </div>
            </div>

            <p className="text-[11px] font-mono leading-relaxed text-on-surface-variant/75 text-center sm:text-left">
              BOOKIE is an educational workspace and study tracker. Google OAuth is used solely for secure sign-in and profile synchronization in adherence to the Google API Services User Data Policy Limited Use requirements. We never sell user data.
            </p>
          </div>
        </div>
      </footer>

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
}
