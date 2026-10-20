import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookieLoader } from "@/components/BookieLoader";
import { ArrowLeft, ArrowUpRight, Info, Rocket, ShieldCheck } from "lucide-react";
import { usePortals } from "@/hooks/usePortals";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";
import { InstituteLogo } from "@/components/common/InstituteLogo";

export default function PortalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPortal } = usePortals();
  const [launching, setLaunching] = useState<string | null>(null);
  const portal = id ? getPortal(id) : undefined;

  if (!portal) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="inline-block p-8 rounded-2xl border border-border/80 bg-card shadow-xs max-w-md">
            <h1 className="font-serif text-2xl font-bold text-foreground">Portal not found</h1>
            <p className="mt-2 text-xs font-sans text-muted-foreground">The coaching portal you requested might have been updated or archived.</p>
            <Button className="mt-5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold" onClick={() => navigate("/portals")}>
              Back to Portals
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (launching) return <BookieLoader label={`Launching ${portal.name}`} />;

  const launch = (url: string) => {
    if (!isSafeUrl(url)) {
      toast({ title: "Blocked", description: "This link is not in the allowed list.", variant: "destructive" });
      return;
    }
    setLaunching(url);
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setLaunching(null);
    }, 900);
  };

  return (
    <Layout>
      <div className="w-full bg-academic-grid min-h-screen pb-24 text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
          <Link
            to="/portals"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Portals Directory</span>
          </Link>

          {/* Hero Header */}
          <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 shadow-xs">
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <InstituteLogo
                id={portal.id}
                name={portal.name}
                logo={portal.logo}
                accent={portal.accent}
                className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl text-2xl border border-border/80 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/80 text-muted-foreground inline-flex items-center">
                    <Rocket className="mr-1 h-3 w-3 text-primary" /> {portal.links.length} link{portal.links.length > 1 ? "s" : ""}
                  </span>
                  <span className="font-mono text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/10 inline-flex items-center">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Direct Coaching Mirror
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  {portal.name}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                  {portal.tagline}
                </p>
              </div>
            </div>
          </header>

          {portal.instructions && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Access Guidance: </strong>{portal.instructions}
              </p>
            </div>
          )}

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Available Access Links ({portal.links.length})
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground">Direct Redirect</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {portal.links.map((l, i) => (
                <button
                  key={l.url}
                  onClick={() => launch(l.url)}
                  className="group relative flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 p-4 text-left shadow-xs transition-all cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {l.label}
                      </span>
                    </div>
                    <span className="mt-1 block text-[11px] font-mono text-muted-foreground truncate">
                      {(() => { try { return new URL(l.url).hostname.replace(/^www\./, ""); } catch { return ""; } })()}
                      {l.note ? ` · ${l.note}` : ""}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl border border-border/80 bg-muted/40 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-10 p-4 rounded-2xl border border-border/80 bg-card text-center font-mono text-[11px] text-muted-foreground">
            Notice: Bookie aggregates links for student accessibility. All rights remain with original copyright holders.
          </div>
        </div>
      </div>
    </Layout>
  );
}