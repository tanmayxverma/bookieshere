import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookieLoader } from "@/components/BookieLoader";
import { ArrowLeft, ArrowUpRight, Info, Rocket } from "lucide-react";
import { PORTALS } from "@/data/portals";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";

export default function PortalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [launching, setLaunching] = useState<string | null>(null);
  const portal = PORTALS.find((p) => p.id === id);

  if (!portal) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-black">Portal not found</h1>
          <Button className="mt-6" onClick={() => navigate("/portals")}>Back to portals</Button>
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
      <div className="container mx-auto px-4 py-8 pb-20">
        <Link to="/portals" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> All portals
        </Link>

        <header className={`relative mt-5 overflow-hidden rounded-[28px] border border-border/50 bg-gradient-to-br ${portal.accent} p-8 md:p-14`}>
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {portal.logo ? (
              <div className="h-24 w-24 rounded-3xl bg-white ring-1 ring-border/60 p-2 flex items-center justify-center shadow-sm shrink-0">
                <img src={portal.logo} alt={`${portal.name} logo`} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-3xl bg-background/80 ring-1 ring-border/60 flex items-center justify-center font-display text-4xl font-black shrink-0">
                {portal.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-3 text-[10px] uppercase tracking-[0.2em]">
                {portal.links.length} link{portal.links.length > 1 ? "s" : ""}
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.95]">{portal.name}</h1>
              <p className="mt-3 text-sm md:text-base italic text-muted-foreground">{portal.tagline}</p>
            </div>
          </div>
        </header>

        {portal.instructions && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">How to use: </strong>{portal.instructions}
            </p>
          </div>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Access links</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {portal.links.map((l, i) => (
              <button
                key={l.url}
                onClick={() => launch(l.url)}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/50 px-5 py-4 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-semibold truncate">{l.label}</span>
                  </div>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground truncate">
                    {(() => { try { return new URL(l.url).hostname.replace(/^www\./, ""); } catch { return ""; } })()}
                    {l.note ? ` · ${l.note}` : ""}
                  </span>
                </div>
                <Rocket className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-[11px] text-muted-foreground/80">
          Bookie does not own or host any content. All links belong to their respective owners.
        </p>
      </div>
    </Layout>
  );
}