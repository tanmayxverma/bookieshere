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
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tg-promo-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl liquid-glass border border-border/50 shadow-xl p-6 text-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4">
          <Send className="h-6 w-6 text-primary" />
        </div>

        <h2 id="tg-promo-title" className="text-lg font-display font-bold tracking-tight">
          Join us on Telegram
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Get the latest book updates &amp; a backup of the site — straight to your phone.
        </p>

        <Button asChild className="w-full mt-5 h-11 gap-2">
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer noopener" onClick={close}>
            <Send className="h-4 w-4" /> Open t.me/bookieshere
          </a>
        </Button>

        <button
          onClick={close}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
