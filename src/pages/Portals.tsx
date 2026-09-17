import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PORTALS, Portal } from "@/data/portals";
import { BookieLoader } from "@/components/BookieLoader";
import { Heart, ArrowUpRight, Sparkles, Info, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

function PortalLogo({ portal, size = 56, className }: { portal: Portal; size?: number, className?: string }) {
  if (portal.logo) {
    return (
      <div 
        className={cn("rounded-xl border-2 border-on-surface flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] overflow-hidden bg-white p-1.5 shrink-0", className)}
        style={{ width: size, height: size }}
      >
        <img
          src={portal.logo}
          alt={`${portal.name} logo`}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }
  // Monogram fallback
  return (
    <div
      className={cn("rounded-xl flex items-center justify-center font-headline-md font-black text-on-surface border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(19,27,46,1)] shrink-0", className)}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${portal.accent.split(' ')[1]?.replace('to-', '')} 0%, ${portal.accent.split(' ')[0]?.replace('from-', '')} 100%)` }}
    >
      <span style={{ fontSize: size / 2.5 }}>{portal.name.substring(0, 2).toUpperCase()}</span>
    </div>
  );
}

export default function Portals() {
  const navigate = useNavigate();
  const { favs, toggle, isFav } = useFavorites();
  const [launching, setLaunching] = useState<{ portal: Portal; url: string } | null>(null);

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
      <div className="w-full bg-background blueprint-grid text-on-surface min-h-screen">
        <main className="max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-xl space-y-space-xl w-full">
          
          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            {/* Left Column: Copy & Meta */}
            <div className="lg:col-span-7 space-y-space-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary-container/20 border-2 border-on-surface text-label-code-sm font-label-code-sm font-bold text-primary shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                🚀 STUDY PORTALS // ZERO TAB CLUTTER
              </div>
              <h1 className="font-headline-xl text-[40px] sm:text-[48px] xl:text-[60px] font-extrabold text-on-surface tracking-tight leading-[1.08]">
                All your study apps. <br className="hidden sm:block" />
                <span className="font-extrabold text-primary tracking-tight">One launcher.</span>
              </h1>
              <p className="text-on-surface-variant text-body-lg max-w-xl font-body-lg leading-relaxed pt-2">
                Curated mirrors, direct bots, and authenticated access points for popular coachings. Zero gaslighting, no broken links.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-label-code-sm font-semibold bg-tertiary-container/30 border border-tertiary-container text-tertiary rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {PORTALS.length} Systems Operational
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-label-code-sm font-semibold bg-secondary-container/50 border border-secondary text-on-secondary-container rounded-full">
                  ⚡ Direct Mirror CDN
                </span>
              </div>
            </div>

            {/* Right Column: Illustrated Cockpit Launcher & Pinned Portals */}
            <div className="lg:col-span-5 relative" data-purpose="hero-illustration">
              <div className="relative bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-space-sm shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] overflow-hidden group">
                {/* Window Header Bar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/30">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-error border border-on-surface"></span>
                    <span className="w-3 h-3 rounded-full bg-secondary border border-on-surface"></span>
                    <span className="w-3 h-3 rounded-full bg-tertiary border border-on-surface"></span>
                  </div>
                  <span className="font-label-code-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                    Cockpit_Launcher_View.sys
                  </span>
                </div>

                {/* Comic / Cockpit Graphic Container */}
                <div className="rounded-xl overflow-hidden border border-on-surface/40 relative bg-slate-900 group">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkb1OV-1M73siQ7ku7B6iI0odUq5ewudnxSyovBPbKcw7xqbSaCkXPUxLG3RdXNxwerTh6HlRP39-dMBAa7c7nbLRm-KNPw9Iv2nUu8GcIHKGPmNq1ZeJ4H7PGLFpjafw1HB_lEqBnJzJZMfkAXMUNIWMr0pMdIIrApp6YHkGbHmnDQgCgr5XTulUVx7XDbhtpfKulK5c98Eo86YjPI_4oSuKW_VhUL62zu7CxlLi2l-aSYXR2EkXpMQ"
                    alt="Study Command Center Cockpit Illustration"
                    className="w-full h-44 sm:h-52 object-cover object-center transform group-hover:scale-[1.02] transition duration-300"
                    loading="lazy"
                  />

                  {/* Pinned Quick-Launch Overlay / Badge Bar */}
                  {favPortals.length > 0 ? (
                    <div className="absolute inset-x-2 bottom-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-on-surface p-2.5 rounded-xl shadow-md">
                      <div className="text-[10px] uppercase tracking-wider text-on-surface font-mono font-bold mb-1.5 flex items-center gap-1.5">
                        <Heart className="h-3 w-3 text-error fill-error" />
                        <span>PINNED PORTALS ({favPortals.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {favPortals.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => navigate(`/portals/${p.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-on-surface bg-surface-container-lowest px-2 py-1 shadow-xs hover:bg-surface-container active:translate-y-[1px] transition-all text-left"
                          >
                            <PortalLogo portal={p} size={18} className="border border-on-surface shadow-none" />
                            <span className="text-[11px] font-bold font-label-ui">{p.name.split(" ")[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-on-surface p-2 rounded-lg shadow-sm flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">📌</span>
                        <p className="text-[11px] font-label-code-sm text-on-surface-variant truncate">
                          Favorite any portal below to pin it here for 1-click launch.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-primary text-on-primary px-2 py-0.5 rounded shrink-0">
                        1-CLICK
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Cockpit Tag */}
                <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs font-label-code-sm">
                  <div className="flex items-center gap-1.5 font-bold text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                    <span>COCKPIT HUB // {PORTALS.length} PORTALS</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-mono">
                    {favPortals.length > 0 ? `${favPortals.length} PINNED` : 'ZERO CLUTTER'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-primary-container/20 border-2 border-on-surface rounded-xl px-4 py-3 flex items-center gap-3 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-code-sm font-bold text-xs shrink-0">
              i
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
              <strong className="text-on-surface font-bold">Bookie does not own or host any content.</strong> All resources belong to their respective owners. Bookie only aggregates publicly shared links for JEE aspirants.
            </p>
          </div>

          {/* Portals Grid */}
          <section className="space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface uppercase tracking-tight">Active Coaching Portals</h2>
                <span className="text-[11px] font-label-code-sm font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant/50">
                  {PORTALS.length} available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {orderedPortals.map((p) => {
                const fav = isFav(p.id);
                return (
                  <article
                    key={p.id}
                    className={cn(
                      "bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-space-md shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] transition-all duration-200 flex flex-col justify-between relative group overflow-hidden"
                    )}
                  >
                    <div className={cn("absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br", p.accent)}></div>
                    
                    <div>
                      <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                          <PortalLogo portal={p} size={48} className={p.accent.includes('purple') ? 'bg-purple-100 text-purple-900' : p.accent.includes('amber') ? 'bg-amber-100 text-amber-900' : ''} />
                          <div>
                            <h3 className="font-headline-md font-bold text-base text-on-surface leading-tight">{p.name}</h3>
                            <p className="text-xs text-on-surface-variant mt-0.5">{p.tagline}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggle(p.id)}
                          aria-label={fav ? "Remove favorite" : "Add favorite"}
                          className="w-8 h-8 rounded-full border-2 border-outline hover:border-on-surface bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-error transition shrink-0 active:scale-90"
                        >
                          <Heart className={cn("w-4 h-4", fav && "fill-error text-error")} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center gap-2 font-label-code-sm text-[11px] font-bold text-on-surface-variant tracking-wider uppercase relative z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        {p.links.length} LINK{p.links.length > 1 ? "S" : ""} AVAILABLE
                        {p.links.length > 5 && (
                          <span className="ml-auto bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-sans font-bold border border-secondary">🔥 Mass Favorite</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant/30 relative z-10">
                      <button
                        onClick={() => navigate(`/portals/${p.id}`)}
                        className="w-full bg-on-surface hover:bg-primary text-background font-label-code-sm font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-sm active:scale-[0.98]"
                      >
                        <span>Open Portal</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Bottom Banter Banner */}
          <section className="mt-12 bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 text-surface-container-high font-headline-xl font-extrabold text-[120px] select-none pointer-events-none opacity-50">
              JEE
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-secondary-container text-on-secondary-container border border-secondary font-label-code-sm text-[11px] font-bold">
                  🚨 ASPIRANT REALITY CHECK
                </div>
                <h4 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface leading-tight">
                  PLOT TWIST: Portal bookmark kar liye, ab lecture play karke notes bhi bana lo!
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-2xl">
                  Collecting 47 gigabytes of coaching batches won't solve Rotational Dynamics. Choose one teacher and stick to the plan.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button onClick={() => navigate('/ypt')} className="px-5 py-3 rounded-xl bg-primary text-on-primary border-2 border-on-surface font-label-code-sm text-xs font-bold shadow-[3px_3px_0px_0px_rgba(19,27,46,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition flex items-center gap-2 whitespace-nowrap">
                  <span>⚡ Launch Study Session</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </Layout>
  );
}