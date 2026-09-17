import { Link } from "react-router-dom";
import { useState } from "react";
import { AdminLoginModal } from "@/components/Admin/AdminLoginModal";

export function Footer() {
  const year = new Date().getFullYear();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="w-full relative mt-space-xl">
      {/* Telegram Drop Channel CTA Card (Matching Brand References) */}
      <section className="w-full max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-sm">
        <div className="relative bg-inverse-surface text-inverse-on-surface rounded-3xl p-space-lg lg:p-space-xl overflow-hidden shadow-xl">
          {/* Subtle Engineering Graph Accent Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          {/* Playful Blueprint Tape on Edge */}
          <div className="absolute -top-3 right-12 w-32 h-6 bg-secondary-container/90 -rotate-3 backdrop-blur-sm hidden sm:block"></div>
          
          <div className="relative z-10 max-w-3xl flex flex-col items-start gap-space-sm">
            <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-primary-container text-on-primary-container font-label-code-sm text-label-code-sm font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              STAY IN THE LOOP // ZERO DELAY
            </div>

            <h2 className="font-headline-xl text-2xl sm:text-headline-xl lg:text-[38px] lg:leading-[44px] text-surface-container-lowest font-extrabold tracking-tight">
              New material drops. Straight to your channel.
            </h2>

            <p className="font-body-lg text-sm sm:text-body-lg text-inverse-on-surface/80 max-w-2xl leading-relaxed">
              Be the first to know when we index fresh Kota test series, PYQ video link updates, Allen milestone modules, and secret classroom notes — no spam, just pure signal.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm sm:gap-space-md mt-space-sm pt-space-xs w-full">
              <a
                href="https://t.me/bookieshere"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-primary text-on-primary font-headline-md text-label-ui uppercase tracking-wide shadow-[0_4px_0_0_#00174b] active:translate-y-1 active:shadow-none transition-all hover:bg-primary/90 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Join Telegram Channel ↗</span>
              </a>
              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-headline-md text-label-ui uppercase tracking-wide transition-colors w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Request a Resource ↗</span>
              </Link>
            </div>

            {/* Mini Channel Metrics */}
            <div className="flex items-center gap-space-md mt-space-sm font-label-code-sm text-label-code-sm text-inverse-on-surface/60">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
                24.8K ASPIRANTS ACTIVE
              </span>
              <span>•</span>
              <span>AVG UPDATE RATE: 2 DROPS / WEEK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="w-full bg-surface-container-low mt-space-xl border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-lg space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex flex-col items-center md:items-start gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                  <span className="font-headline-md text-[13px] text-on-primary font-bold">B</span>
                </div>
                <span className="font-headline-md text-label-ui font-extrabold text-on-surface tracking-wide">BOOKIE® COCKPIT</span>
              </div>
              <p className="font-body-sm text-xs sm:text-body-sm text-on-surface-variant text-center md:text-left">
                © {year} BOOKIE • Engineered for Ambitious Aspirants
              </p>
            </div>
            
            {/* Primary Navigation & Resource Links */}
            <div className="flex flex-wrap items-center justify-center gap-space-md sm:gap-space-lg font-label-code-sm text-label-code-sm tracking-wider text-on-surface-variant">
              <Link to="/materials" className="hover:text-primary transition-colors">PRACTICE</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/tests" className="hover:text-primary transition-colors">PROGRESS</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/ypt" className="hover:text-primary transition-colors">PERFORM</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/community" className="hover:text-primary transition-colors">COMMUNITY</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/donate" className="hover:text-primary transition-colors">CHAI ☕</Link>
              <div className="hidden sm:flex items-center gap-space-xs px-2.5 py-0.5 rounded-full bg-surface-container text-tertiary font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                AIR TARGET 2027
              </div>
            </div>
          </div>

          {/* Legal & Compliance Strip for Google Cloud Verification */}
          <div className="pt-4 border-t border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-on-surface-variant">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
              <Link to="/terms" className="text-foreground hover:text-primary font-bold underline transition-colors">
                Terms of Service
              </Link>
              <span className="text-outline-variant">•</span>
              <Link to="/privacy" className="text-foreground hover:text-primary font-bold underline transition-colors">
                Privacy Policy
              </Link>
              <span className="text-outline-variant">•</span>
              <Link to="/dmca" className="hover:text-primary transition-colors">
                DMCA & Copyright
              </Link>
              <span className="text-outline-variant">•</span>
              <Link to="/support" className="hover:text-primary transition-colors">
                Support Desk
              </Link>
              {/* Hidden admin entry */}
              <button
                onClick={() => setAdminOpen(true)}
                aria-label="Admin"
                title="·"
                className="text-muted-foreground/20 hover:text-muted-foreground transition-colors text-[10px] tracking-widest px-1"
              >
                ·
              </button>
            </div>

            {/* Enquiries & Verification Contact */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center md:text-right text-[11px] text-muted-foreground">
              <span>Legal & Verification Enquiries:</span>
              <Link to="/support" className="text-primary hover:underline font-bold">
                Support Desk
              </Link>
            </div>
          </div>

          {/* Micro Disclaimer Note */}
          <div className="text-[10.5px] font-mono text-muted-foreground/80 leading-relaxed text-center md:text-left">
            BOOKIE is an educational workspace and study tracker. Google OAuth is used solely for secure sign-in and profile synchronization in adherence to the Google API Services User Data Policy Limited Use requirements. We never sell user data.
          </div>
        </div>
      </footer>

      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  );
}
