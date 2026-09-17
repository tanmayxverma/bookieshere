import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SESSION_KEY = 'bookie_tg_promo_shown';
const DELAY_MS = 5000;
const TELEGRAM_URL = 'https://t.me/bookieshere';

/**
 * Small site-wide promo popup for the Telegram channel.
 * Shows once per browser-tab session, ~5s after the app mounts.
 */
export function TelegramPromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch { /* private mode — just show once per mount */ }

    const t = window.setTimeout(() => {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
      setOpen(true);
    }, DELAY_MS);

    return () => window.clearTimeout(t);
  }, []);

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tg-promo-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl border-2 border-on-surface shadow-[8px_8px_0px_0px_rgba(19,27,46,1)] overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar: Blueprint Electric Blue & Warning Amber Gradient */}
        <div className="h-2.5 w-full bg-gradient-to-r from-primary via-primary-container to-secondary-container"></div>

        <div className="p-6 sm:p-8">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 p-2.5 bg-primary text-on-primary rounded-2xl shadow-md border-2 border-on-surface flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 -translate-x-[1px] translate-y-[1px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/30 font-label-code-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    FAILSAFE SYSTEM
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/30">
                    CRITICAL BACKUP
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1 font-label-code-sm">BOOKIE Live Infrastructure</p>
              </div>
            </div>

            <button 
              onClick={close}
              aria-label="Close" 
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors border border-outline-variant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Headline */}
          <div className="mb-5 text-left">
            <h2 id="tg-promo-title" className="text-xl sm:text-2xl font-headline-md font-extrabold text-on-surface tracking-tight leading-snug">
              Never lose your study library. <span className="text-primary block sm:inline">Join the Backup Channel.</span>
            </h2>
            <p className="text-on-surface-variant text-xs sm:text-sm mt-2 leading-relaxed font-body-sm">
              Domains get flagged and exam-week traffic spikes cause outages. Our official Telegram operates as our uncensored failsafe mirror — keeping 100% of your notes, modules, and test series accessible.
            </p>
          </div>

          {/* Callout Box */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/60 mb-5 text-left">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary text-on-primary rounded-lg mt-0.5 shrink-0">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
              </div>
              <div>
                <span className="text-xs font-headline-md font-bold text-on-surface block">Zero Downtime Guarantee</span>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed font-body-sm">
                  Daily mirror links, drive refresh tokens, and direct PDF downloads dropped directly to Telegram.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer noopener"
              onClick={close}
              className="w-full sm:flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary font-headline-md font-bold text-sm shadow-[0_4px_0_0_#131b2e] hover:bg-primary-hover active:translate-y-1 active:shadow-none transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Join Official Telegram</span>
            </a>
            <button
              onClick={close}
              type="button"
              className="w-full sm:w-auto px-4 h-12 rounded-xl text-xs font-label-code-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              Remind Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
