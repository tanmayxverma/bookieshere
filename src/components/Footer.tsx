import { Link } from "react-router-dom";
import { useState } from "react";
import { Send, PlusCircle } from "lucide-react";
import { AdminLoginModal } from "@/components/Admin/AdminLoginModal";
import logo from "@/assets/logo.png";

export function Footer() {
  const year = new Date().getFullYear();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="w-full relative mt-space-xl">
      {/* Telegram Drop Channel CTA Card (Matching Brand References) */}
      <section className="w-full max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-sm">
        <div className="relative bg-slate-900 dark:bg-slate-900 border-2 border-slate-800 text-white rounded-3xl p-space-lg lg:p-space-xl overflow-hidden shadow-xl">
          {/* Subtle Engineering Graph Accent Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          {/* Playful Blueprint Tape on Edge */}
          <div className="absolute -top-3 right-12 w-32 h-6 bg-secondary-container/90 -rotate-3 backdrop-blur-sm hidden sm:block"></div>
          
          <div className="relative z-10 max-w-3xl flex flex-col items-start gap-space-sm">
            <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-primary text-white font-label-code-sm text-label-code-sm font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              STAY IN THE LOOP // ZERO DELAY
            </div>

            <h2 className="font-headline-xl text-headline-xl lg:text-[38px] lg:leading-[44px] text-white font-extrabold tracking-tight">
              New material drops. Straight to your channel.
            </h2>

            <p className="font-body-lg text-body-lg text-slate-300 max-w-2xl leading-relaxed">
              Be the first to know when we index fresh Kota test series, PYQ video link updates, Allen milestone modules, and secret classroom notes — no spam, just pure signal.
            </p>

            <div className="flex flex-wrap items-center gap-space-md mt-space-sm pt-space-xs">
              <a
                href="https://t.me/bookieshere"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-space-lg py-3 rounded-full bg-primary text-white font-headline-md text-label-ui uppercase tracking-wide shadow-[0_4px_0_0_#00174b] active:translate-y-1 active:shadow-none transition-all hover:bg-primary/90 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Join Telegram Channel ↗</span>
              </a>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 px-space-lg py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-headline-md text-label-ui uppercase tracking-wide transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request a Resource ↗</span>
              </Link>
            </div>

            {/* Mini Channel Metrics */}
            <div className="flex items-center gap-space-md mt-space-sm font-label-code-sm text-label-code-sm text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                24.8K ASPIRANTS ACTIVE
              </span>
              <span>•</span>
              <span>AVG UPDATE RATE: 2 DROPS / WEEK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="w-full bg-surface-container-low dark:bg-slate-950 mt-space-xl border-t border-outline-variant/20 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-col items-center md:items-start gap-space-xs">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Bookie"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-border/50 shadow-xs"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
              <span className="font-headline-md text-label-ui font-extrabold text-on-surface tracking-wide">BOOKIE®</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">
              © {year} | Engineered for Ambitious Aspirants
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-space-md sm:gap-space-lg">
            <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm tracking-wider text-on-surface-variant">
              <Link to="/materials" className="hover:text-primary transition-colors">PRACTICE</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/tests" className="hover:text-primary transition-colors">PROGRESS</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/ypt" className="hover:text-primary transition-colors">PERFORM</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/donate" className="hover:text-primary transition-colors">CHAI ☕</Link>
              <span className="text-outline-variant">•</span>
              <Link to="/dmca" className="hover:text-primary transition-colors">DMCA</Link>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs font-label-code-sm text-label-code-sm px-space-sm py-1 rounded-full bg-surface-container text-tertiary font-bold">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
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
