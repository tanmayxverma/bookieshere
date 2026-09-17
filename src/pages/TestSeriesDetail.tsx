import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpRight, Sparkles, Library } from "lucide-react";
import { TEST_SERIES } from "@/data/testSeries";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";

export default function TestSeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = TEST_SERIES.find((p) => p.id === id);

  if (!provider) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-black">Test series not found</h1>
          <Button className="mt-6" onClick={() => navigate("/tests")}>Back to hub</Button>
        </div>
      </Layout>
    );
  }

  const open = (url: string) => {
    if (!isSafeUrl(url)) {
      toast({ title: "Link blocked", description: "This URL isn't on the allowed list.", variant: "destructive" });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-20">
        <Link to="/tests" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Test Series Hub
        </Link>

        {/* Hero */}
        <header className={`relative mt-5 overflow-hidden rounded-[28px] border border-border/50 bg-gradient-to-br ${provider.accent} p-8 md:p-12`}>
          <div aria-hidden className="pointer-events-none absolute -top-28 -right-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end gap-6">
            <div className="h-24 w-24 shrink-0 rounded-3xl overflow-hidden bg-white ring-1 ring-border/60 flex items-center justify-center p-2 shadow-sm">
              {provider.logo ? (
                <img src={provider.logo} alt={`${provider.name} logo`} className="h-full w-full object-contain" />
              ) : (
                <span className="font-display text-4xl font-black text-foreground/80">{provider.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-3 text-[10px] uppercase tracking-[0.2em]">
                <Library className="mr-1 h-3 w-3" /> {provider.resources.length} resources
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[0.95]">{provider.name}</h1>
              <p className="mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">{provider.description}</p>
            </div>
          </div>
        </header>

        {/* Resources */}
        <section className="mt-10">
          <h2 className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Resources</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {provider.resources.map((r, i) => (
              <button
                key={r.name + r.url}
                onClick={() => open(r.url)}
                className="group relative flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/50 px-5 py-4 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-semibold truncate">{r.name}</span>
                    {r.badge && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        <Sparkles className="h-2 w-2" /> {r.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground truncate">
                    {(() => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return ""; } })()}
                  </span>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-[11px] text-muted-foreground/80">
          Bookie does not own or host any content. All resources belong to their respective owners.
        </p>
      </div>
    </Layout>
  );
}