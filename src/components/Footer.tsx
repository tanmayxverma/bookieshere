import { Link } from "react-router-dom";
import { useState } from "react";
import { MessageSquare, BookOpen, ArrowUpRight, Sparkles, Coffee, Heart, LifeBuoy, Send } from "lucide-react";
import logo from "@/assets/logo.jfif";
import { Button } from "@/components/ui/button";
import { AdminLoginModal } from "@/components/Admin/AdminLoginModal";

export function Footer() {
  const year = new Date().getFullYear();
  const [adminOpen, setAdminOpen] = useState(false);
  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-surface-1">
      {/* Ambient glows — editorial glass premium */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[380px] w-[380px] rounded-full bg-jee/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.06),transparent_60%)]" />

      {/* CTA Block */}
      <section className="relative">
        <div className="container mx-auto px-4 py-20 lg:py-24">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.25)]">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-jee/5" />
            <div aria-hidden className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative grid lg:grid-cols-12 gap-10 p-10 lg:p-14 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Stay in the loop
                </span>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[0.95]">
                  New material drops.{" "}
                  <span className="italic font-medium text-muted-foreground">Straight to your channel.</span>
                </h2>
                <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
                  Be the first to know when we add fresh modules, PYQs, test series and Cengage releases — no spam, just signal.
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className="group h-14 gap-3 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 text-base font-semibold"
                >
                  <a
                    href="https://t.me/bookieshere"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="h-5 w-5" />
                    Join Telegram Channel
                    <ArrowUpRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group h-14 gap-3 rounded-2xl border-border/60 bg-surface-2/40 backdrop-blur hover:bg-surface-2/80 text-base"
                >
                  <Link to="/materials">
                    <BookOpen className="h-5 w-5" />
                    Browse Materials
                    <ArrowUpRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Editorial Strip */}
      <div className="relative border-t border-border/40 bg-surface-2/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Brand block */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="BOOKIE Logo" className="h-10 w-10 rounded-xl object-cover ring-1 ring-border/60 shadow-sm" />
                <div className="leading-tight">
                  <div className="font-display text-xl font-black tracking-tight text-foreground">BOOKIE<span className="text-primary">®</span></div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Serious JEE Prep</div>
                </div>
              </div>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                A curated, distraction-free library of premium JEE resources — built for aspirants who mean it.
              </p>

              {/* Buy Me a Chai — micro card */}
              <Link
                to="/donate"
                className="group relative mt-4 flex items-center gap-3 max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-3 pr-4 transition-all hover:border-primary/40 hover:bg-card/70 hover:shadow-[0_15px_40px_-15px_hsl(var(--primary)/0.45)]"
              >
                <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative shrink-0 h-11 w-11 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-primary group-hover:rotate-[-8deg] transition-transform duration-500" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-primary">Support</span>
                    <Heart className="h-2.5 w-2.5 text-primary fill-primary" />
                  </div>
                  <div className="text-sm font-semibold text-foreground leading-tight">Buy me a Chai</div>
                  <div className="text-[11px] text-muted-foreground truncate">Keep BOOKIE running ☕</div>
                </div>
                <ArrowUpRight className="relative h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>

            {/* Explore */}
            <div className="lg:col-span-3 space-y-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">Explore</div>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/materials" className="text-foreground/80 hover:text-foreground transition-colors">Materials</Link></li>
                <li><Link to="/tests" className="text-foreground/80 hover:text-foreground transition-colors">Tests</Link></li>
                <li><Link to="/ypt" className="text-foreground/80 hover:text-foreground transition-colors">Study Tracker</Link></li>
                <li><Link to="/portals" className="text-foreground/80 hover:text-foreground transition-colors">Portals</Link></li>
                <li><Link to="/support" className="text-foreground/80 hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">Legal</div>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/copyright-terms" className="text-foreground/80 hover:text-foreground transition-colors">Copyright & Terms</Link></li>
                <li><Link to="/dmca" className="text-foreground/80 hover:text-foreground transition-colors">DMCA Policy</Link></li>
                <li><Link to="/privacy-policy" className="text-foreground/80 hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/donate" className="text-foreground/80 hover:text-foreground transition-colors">Support / Donate</Link></li>
                <li>
                  <Link to="/support" className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors">
                    Contact via Chat <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/70">
              © {year} BOOKIE. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
                Crafted for aspirants · Made with discipline
              </p>
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
          </div>
        </div>

        {/* Oversized brand watermark */}
        <div aria-hidden className="pointer-events-none select-none overflow-hidden">
          <div className="font-display text-[22vw] lg:text-[16vw] font-black leading-none text-foreground/[0.025] text-center -mt-4 -mb-4 tracking-tighter">
            BOOKIE
          </div>
        </div>
      </div>
      <AdminLoginModal open={adminOpen} onOpenChange={setAdminOpen} />
    </footer>
  );
}
