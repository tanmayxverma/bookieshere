import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import type { Portal } from "@/data/portals";
import { usePortals } from "@/hooks/usePortals";
import { BookieLoader } from "@/components/BookieLoader";
import { Heart, ArrowUpRight, Zap, Info, Rocket, Flame, Pin, ShieldCheck, Search, X } from "lucide-react";
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

function PortalLogo({ portal, size = 44, className }: { portal: Portal; size?: number; className?: string }) {
  return (
    <InstituteLogo
      id={portal.id}
      name={portal.name}
      logo={portal.logo}
      accent={portal.accent}
      size={size}
      className={cn("rounded-xl border border-border/80 shadow-xs", className)}
    />
  );
}

export default function Portals() {
  const navigate = useNavigate();
  const { favs, toggle, isFav } = useFavorites();
  const { portals } = usePortals();
  const [launching, setLaunching] = useState<{ portal: Portal; url: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");

  const filteredPortals = useMemo(() => {
    let list = portals || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.links.some((l) => l.label.toLowerCase().includes(q))
      );
    }
    if (filterTag !== "all") {
      list = list.filter((p) => {
        if (filterTag === "pw") return p.id.includes("pw") || p.name.toLowerCase().includes("physics wallah");
        if (filterTag === "unacademy") return p.id.includes("unacademy") || p.name.toLowerCase().includes("unacademy");
        if (filterTag === "allen") return p.id.includes("allen") || p.name.toLowerCase().includes("allen");
        return true;
      });
    }

    const favSet = new Set(favs);
    return [...list].sort((a, b) => {
      const af = favSet.has(a.id) ? 0 : 1;
      const bf = favSet.has(b.id) ? 0 : 1;
      return af - bf;
    });
  }, [portals, favs, search, filterTag]);

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
      <div className="w-full bg-academic-grid text-foreground min-h-screen pb-24">
        {/* Sub-bar Telemetry Ticker (Stitch Screen 09) */}
        <div className="w-full border-b border-border/80 bg-background/60 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Aspirant Workspace: <span className="text-foreground font-semibold">JEE 2027 TARGET</span></span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span>ZERO TAB CLUTTER</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{(portals || []).length} SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 w-full">
          {/* Hero Section (Stitch Screen 09) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Left Column: Dossier Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 border border-primary/20 text-primary tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>STUDY PORTALS // ZERO TAB CLUTTER • DIRECT MIRROR CDN</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.12]">
                All your study apps. <br />
                <span className="font-serif italic font-normal text-primary">One launcher.</span>
              </h1>

              <p className="font-sans text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed">
                Curated mirrors, authenticated access points, and direct bots for premier coaching platforms. Zero gaslighting, zero broken links, engineered for non-stop focus.
              </p>

              {/* Status Badges Strip */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {(portals || []).length} Systems Operational
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Direct Mirror CDN
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-muted-foreground bg-card border border-border/80">
                  🔒 End-to-End Auth Tokens
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Cockpit Schematic Card (Stitch Screen 09) */}
            <div className="lg:col-span-5">
              <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden transition-all hover:border-primary/40">
                {/* Academic Window Header */}
                <div className="px-4 py-2.5 bg-muted/40 border-b border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 inline-block"></span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground tracking-wider">
                    COCKPIT_LAUNCHER_VIEW.SYS
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    PING: 14ms
                  </span>
                </div>

                {/* Schematic Canvas */}
                <div className="p-5 space-y-4">
                  {/* Simulated Cockpit Stream UI */}
                  <div className="relative w-full h-36 rounded-xl bg-gradient-to-br from-slate-900 via-neutral-900 to-sky-950 p-3.5 text-white border border-neutral-800 flex flex-col justify-between overflow-hidden shadow-inner">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>STATION // ALPHA-01</span>
                      <span className="text-emerald-400 flex items-center gap-1">● SYNCED</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-auto">
                      <div className="bg-white/10 backdrop-blur-xs rounded-lg p-1.5 text-center border border-white/10">
                        <span className="text-[9px] block text-neutral-300 font-mono">PW KHAZANA</span>
                        <span className="text-xs font-semibold text-amber-300">4K 60FPS</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs rounded-lg p-1.5 text-center border border-white/10">
                        <span className="text-[9px] block text-neutral-300 font-mono">COMPETISHUN</span>
                        <span className="text-xs font-semibold text-sky-300">BOT ACTIVE</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs rounded-lg p-1.5 text-center border border-white/10">
                        <span className="text-[9px] block text-neutral-300 font-mono">VIBRANT PDF</span>
                        <span className="text-xs font-semibold text-emerald-300">MIRROR 02</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>BUFFER: 0.02s</span>
                      <span className="text-neutral-300 font-sans">Aspirant Focus Mode</span>
                    </div>
                  </div>

                  {/* Pinned Portals Bar */}
                  {favPortals.length > 0 ? (
                    <div className="p-2.5 bg-muted/40 rounded-xl border border-border/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase text-muted-foreground">
                        <span className="flex items-center gap-1 text-primary">
                          <Heart className="w-3 h-3 fill-primary" /> Pinned Mirrors ({favPortals.length})
                        </span>
                        <span>1-Click Launch</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {favPortals.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => navigate(`/portals/${p.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-semibold hover:border-primary transition-colors cursor-pointer"
                          >
                            <PortalLogo portal={p} size={16} className="border-0 shadow-none rounded" />
                            <span>{(p.name || "").split(" ")[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-sans bg-muted/30 rounded-xl p-3 border border-border/80">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs">Favorite any portal below to pin it here</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-semibold text-foreground bg-card px-2 py-0.5 rounded border border-border/80 shrink-0">
                        1-CLICK
                      </span>
                    </div>
                  )}

                  {/* Terminal Footnote */}
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground pt-1 border-t border-border/80">
                    <span>● COCKPIT HUB // {(portals || []).length} PORTALS</span>
                    <span>ZERO CLUTTER ENGINE</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Disclaimer Banner (Stitch Screen 09) */}
          <section className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs font-sans text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-[11px]">
              i
            </div>
            <div className="leading-relaxed">
              <strong className="font-semibold text-foreground">Bookie Archival Protocol: </strong>
              Bookie does not own or host proprietary video lectures, test files, or copyrighted coaching materials. All intellectual properties belong exclusively to their respective faculty, educators, and institutes. Bookie functions solely as an aggregated, authenticated link index and direct mirror relay for serious JEE & NEET aspirants.
            </div>
          </section>

          {/* Portals Matrix Section (Stitch Screen 09) */}
          <section className="space-y-4 pt-2">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">⚡</span>
                  <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-foreground">
                    ACTIVE COACHING PORTALS
                  </h2>
                </div>
                <span className="font-mono text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border/80">
                  {filteredPortals.length} available
                </span>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-card rounded-xl border border-border/80 p-0.5 text-xs font-medium">
                  {[
                    { id: "all", label: "All Portals" },
                    { id: "pw", label: "PW Mirrors" },
                    { id: "unacademy", label: "Unacademy" },
                    { id: "allen", label: "Allen / Kota" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTag(tab.id)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer",
                        filterTag === tab.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Quick Search */}
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search portals..."
                    className="text-xs bg-card border border-border/80 rounded-xl pl-8 pr-8 py-1.5 focus:border-primary focus:outline-none w-44 sm:w-52 placeholder:text-muted-foreground"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Portal Cards Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredPortals.map((p) => {
                const fav = isFav(p.id);
                return (
                  <article
                    key={p.id}
                    className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group relative"
                  >
                    <div>
                      {/* Card Header: Monogram, Title & Heart */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <PortalLogo portal={p} size={46} />
                          <div>
                            <h3 className="font-serif font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                              {p.name}
                            </h3>
                            <p className="text-xs font-sans text-muted-foreground mt-0.5 line-clamp-1">
                              {p.tagline}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggle(p.id)}
                          aria-label={fav ? "Remove favorite" : "Add favorite"}
                          className="w-8 h-8 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition shrink-0 cursor-pointer"
                        >
                          <Heart className={cn("w-4 h-4", fav && "fill-destructive text-destructive")} />
                        </button>
                      </div>

                      {/* Traffic & Link Telemetry */}
                      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{p.links.length} LINK{p.links.length > 1 ? "S" : ""} ACTIVE</span>
                        {p.links.length > 5 && (
                          <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold border border-primary/20 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> High Traffic
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Launch Action */}
                    <div className="pt-3 border-t border-border/60">
                      <button
                        onClick={() => navigate(`/portals/${p.id}`)}
                        className="w-full bg-slate-900 hover:bg-black text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <span>Open Portal Hub</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Bottom Reality Check Callout */}
          <section className="mt-8 bg-card border border-border/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 font-mono text-xs font-semibold text-primary">
                  <Zap className="w-3.5 h-3.5" />
                  <span>ASPIRANT REALITY CHECK</span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-tight">
                  Portal save kar liya, ab lecture play karke formula revision shuru karo!
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-2xl">
                  Hoarding 50 coaching portals won't solve Rotational Dynamics. Choose your primary faculty and complete one test series honestly.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => navigate('/ypt')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-sans text-xs font-semibold shadow-xs hover:bg-primary/90 transition flex items-center gap-2 whitespace-nowrap cursor-pointer"
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