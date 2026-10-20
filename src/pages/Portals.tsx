import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import type { Portal } from "@/data/portals";
import { usePortals } from "@/hooks/usePortals";
import { BookieLoader } from "@/components/BookieLoader";
import { Heart, ArrowUpRight, Zap, Info, Rocket, Flame, Pin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { InstituteLogo } from "@/components/common/InstituteLogo";

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

function PortalLogo({ portal, size = 56, className }: { portal: Portal; size?: number; className?: string }) {
  return (
    <InstituteLogo
      id={portal.id}
      name={portal.name}
      logo={portal.logo}
      accent={portal.accent}
      size={size}
      className={cn("rounded-lg border-2 border-border shadow-[2px_2px_0px_var(--desk-border)]", className)}
    />
  );
}

export default function Portals() {
  const navigate = useNavigate();
  const { favs, toggle, isFav } = useFavorites();
  const { portals } = usePortals();
  const [launching, setLaunching] = useState<{ portal: Portal; url: string } | null>(null);

  const orderedPortals = useMemo(() => {
    const list = portals || [];
    const favSet = new Set(favs);
    return [...list].sort((a, b) => {
      const af = favSet.has(a.id) ? 0 : 1;
      const bf = favSet.has(b.id) ? 0 : 1;
      return af - bf;
    });
  }, [portals, favs]);

  const favPortals = useMemo(() => {
    const list = portals || [];
    return list.filter((p) => favs.includes(p.id));
  }, [portals, favs]);

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
      <div className="w-full bg-background text-foreground min-h-screen pb-24">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 w-full">
          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted border-2 border-border font-mono text-xs font-bold text-foreground shadow-[2px_2px_0px_var(--desk-border)]">
                <Rocket className="w-3.5 h-3.5 text-primary" />
                <span>STUDY PORTALS // ZERO TAB CLUTTER</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                All coaching portals. <br className="hidden sm:block" />
                <span className="text-primary underline decoration-primary/40 decoration-wavy underline-offset-4">One direct launcher.</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-sans max-w-xl leading-relaxed pt-1">
                Curated mirrors, direct bots, and authenticated access points for popular coachings. Zero gaslighting, no dead links.
              </p>
              
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-muted border border-border text-foreground rounded-md shadow-[1px_1px_0px_var(--desk-border)]">
                  <span className="w-2 h-2 rounded-full bg-primary" /> {(portals || []).length} Systems Operational
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-primary/10 border border-primary/30 text-primary rounded-md shadow-[1px_1px_0px_var(--desk-border)]">
                  <Zap className="w-3.5 h-3.5" /> Direct Mirror CDN
                </span>
              </div>
            </div>

            {/* Right Column: Pinned Portals Carrel */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-card border-2 border-border rounded-xl p-4 shadow-[4px_4px_0px_var(--desk-border)] overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive border border-border" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary border border-border" />
                    <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Portal_Desk_Launcher.sys
                  </span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
                  {favPortals.length > 0 ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-foreground font-mono font-bold mb-2 flex items-center gap-1.5">
                        <Heart className="h-3 w-3 text-destructive fill-destructive" />
                        <span>PINNED PORTALS ({favPortals.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {favPortals.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => navigate(`/portals/${p.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-border bg-card px-2.5 py-1 shadow-[1px_1px_0px_var(--desk-border)] hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left"
                          >
                            <PortalLogo portal={p} size={16} className="border border-border shadow-none" />
                            <span className="text-xs font-bold font-sans">{(p.name || "").split(" ")[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-card border-2 border-border rounded-lg shadow-[2px_2px_0px_var(--desk-border)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Pin className="w-4 h-4 text-primary shrink-0" />
                        <p className="text-xs font-sans text-muted-foreground truncate">
                          Favorite any portal below to pin it here for 1-click launch.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded shrink-0">
                        PINNED
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>COCKPIT HUB // {(portals || []).length} PORTALS</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {favPortals.length > 0 ? `${favPortals.length} PINNED` : "CLEAN DESK"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-muted/50 border-2 border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-[2px_2px_0px_var(--desk-border)]">
            <div className="w-6 h-6 rounded-md bg-card border border-border text-primary flex items-center justify-center font-mono font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs font-sans text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Bookie does not own or host any external content.</strong> All resources belong to their respective owners. Bookie aggregates publicly accessible tools for serious JEE aspirants.
            </p>
          </div>

          {/* Portals Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground uppercase tracking-tight">Active Coaching Portals</h2>
                <span className="text-xs font-mono font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
                  {(portals || []).length} mirrors
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orderedPortals.map((p) => {
                const fav = isFav(p.id);
                return (
                  <article
                    key={p.id}
                    className="bg-card border-2 border-border rounded-xl p-5 shadow-[4px_4px_0px_var(--desk-border)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_var(--desk-border)] transition-all flex flex-col justify-between relative group overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                          <PortalLogo portal={p} size={44} />
                          <div>
                            <h3 className="font-display font-bold text-base text-foreground leading-tight">{p.name}</h3>
                            <p className="text-xs font-sans text-muted-foreground mt-0.5">{p.tagline}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggle(p.id)}
                          aria-label={fav ? "Remove favorite" : "Add favorite"}
                          className="w-8 h-8 rounded-lg border-2 border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition shrink-0 active:translate-x-0.5 active:translate-y-0.5"
                        >
                          <Heart className={cn("w-4 h-4", fav && "fill-destructive text-destructive")} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] font-bold text-muted-foreground tracking-wider uppercase relative z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {p.links.length} LINK{p.links.length > 1 ? "S" : ""} ACTIVE
                        {p.links.length > 5 && (
                          <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border border-primary/30 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> High Traffic
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border relative z-10">
                      <button
                        onClick={() => navigate(`/portals/${p.id}`)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
                      >
                        <span>Open Portal Hub</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Bottom Callout */}
          <section className="mt-8 bg-card border-2 border-border rounded-xl p-5 sm:p-6 shadow-[4px_4px_0px_var(--desk-border)] relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border bg-muted font-mono text-xs font-bold text-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span>ASPIRANT REALITY CHECK</span>
                </div>
                <h4 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  Portal save kar liya, ab lecture play karke formula revision shuru karo!
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-2xl">
                  Hoarding 50 coaching portals won't solve Rotational Dynamics. Choose your primary faculty and complete one test series honestly.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => navigate('/ypt')}
                  className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground border-2 border-border font-sans text-xs font-bold shadow-[2px_2px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Study Carrel</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}