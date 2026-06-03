import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { PORTALS, Portal } from "@/data/portals";
import { BookieLoader } from "@/components/BookieLoader";
import { Heart, ArrowUpRight, Sparkles, ExternalLink, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";

const FAV_KEY = "bookie_portal_favs_v1";

function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(JSON.parse(raw));
    } catch {}
  }, []);
  const toggle = (id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return { favs, toggle, isFav: (id: string) => favs.includes(id) };
}

function PortalLogo({ portal, size = 56 }: { portal: Portal; size?: number }) {
  if (portal.logo) {
    return (
      <img
        src={portal.logo}
        alt={`${portal.name} logo`}
        loading="lazy"
        className="object-cover rounded-2xl ring-1 ring-border/50 bg-background"
        style={{ width: size, height: size }}
      />
    );
  }
  // Monogram fallback
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-display font-black text-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-foreground ring-1 ring-border/50"
      style={{ width: size, height: size }}
    >
      {portal.name.charAt(0)}
    </div>
  );
}

export default function Portals() {
  const { favs, toggle, isFav } = useFavorites();
  const [launching, setLaunching] = useState<{ portal: Portal; url: string } | null>(null);
  const [openPortal, setOpenPortal] = useState<Portal | null>(null);

  const orderedPortals = useMemo(() => {
    const favSet = new Set(favs);
    return [...PORTALS].sort((a, b) => {
      const af = favSet.has(a.id) ? 0 : 1;
      const bf = favSet.has(b.id) ? 0 : 1;
      return af - bf;
    });
  }, [favs]);

  const favPortals = PORTALS.filter((p) => favs.includes(p.id));

  const launch = (portal: Portal, url: string) => {
    if (!isSafeUrl(url)) {
      toast({ title: "Blocked", description: "This link is not in the allowed list.", variant: "destructive" });
      return;
    }
    setLaunching({ portal, url });
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setLaunching(null);
    }, 1200);
  };

  if (launching) {
    return <BookieLoader label={`Launching ${launching.portal.name}`} />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 pb-20">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface-2/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> Study Portals
            </span>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.05]">
              All your study apps. <span className="italic font-medium text-muted-foreground">One launcher.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Curated mirrors and access points for popular JEE coachings. Tap any portal to view its links.
            </p>
          </div>

          {/* Favorites top-right */}
          {favPortals.length > 0 && (
            <div className="md:max-w-sm w-full">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 mb-2 flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-primary fill-primary" /> Favorites
              </div>
              <div className="flex flex-wrap gap-2">
                {favPortals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setOpenPortal(p)}
                    className="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur px-2 py-1 pr-3 hover:border-primary/40 transition"
                  >
                    <PortalLogo portal={p} size={22} />
                    <span className="text-xs font-semibold">{p.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Disclaimer */}
        <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-border/40 bg-surface-2/40 backdrop-blur px-4 py-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary/80" />
          <p>
            <strong className="text-foreground">Bookie does not own or host any content.</strong> All resources belong to their respective owners. Bookie only aggregates publicly shared links.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orderedPortals.map((p) => {
            const fav = isFav(p.id);
            return (
              <article
                key={p.id}
                className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)]`}
              >
                <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-40 pointer-events-none`} />
                <div className="relative flex items-start gap-4">
                  <PortalLogo portal={p} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold leading-tight truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{p.tagline}</p>
                      </div>
                      <button
                        onClick={() => toggle(p.id)}
                        aria-label={fav ? "Remove favorite" : "Add favorite"}
                        className={`shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition ${
                          fav
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/50 bg-background/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${fav ? "fill-primary" : ""}`} />
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                      {p.links.length} link{p.links.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setOpenPortal(p)}
                  className="relative mt-5 w-full h-10 rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  Open Portal <ArrowUpRight className="h-4 w-4" />
                </Button>
              </article>
            );
          })}
        </div>
      </div>

      {/* Portal Detail Dialog */}
      <Dialog open={!!openPortal} onOpenChange={(o) => !o && setOpenPortal(null)}>
        <DialogContent className="max-w-lg">
          {openPortal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <PortalLogo portal={openPortal} size={48} />
                  <div className="min-w-0">
                    <DialogTitle className="font-display text-xl">{openPortal.name}</DialogTitle>
                    <DialogDescription>{openPortal.tagline}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {openPortal.instructions && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground/90 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-1.5">
                    <Info className="h-3 w-3" /> Instructions
                  </div>
                  {openPortal.instructions}
                </div>
              )}

              <div className="space-y-2 mt-1 max-h-[55vh] overflow-y-auto pr-1">
                {openPortal.links.map((link, i) => (
                  <button
                    key={link.url}
                    onClick={() => launch(openPortal, link.url)}
                    className="w-full group flex items-center gap-3 rounded-xl border border-border/50 bg-surface-2/40 hover:bg-surface-2/80 hover:border-primary/40 transition px-3 py-3 text-left"
                  >
                    <span className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate">{link.label}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{link.url}</span>
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground/70 leading-relaxed mt-2">
                Bookie does not own or host any content. All resources belong to their respective owners.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}