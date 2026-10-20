import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpRight, Library, ShieldCheck, ExternalLink } from "lucide-react";
import { useTestSeries } from "@/hooks/useTestSeries";
import { isSafeUrl } from "@/lib/urlValidation";
import { toast } from "@/hooks/use-toast";
import { InstituteLogo } from "@/components/common/InstituteLogo";

export default function TestSeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTestSeries } = useTestSeries();
  const provider = id ? getTestSeries(id) : undefined;

  if (!provider) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="inline-block p-8 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0px_var(--desk-border)]">
            <h1 className="font-display text-2xl font-black text-foreground">Test series not found</h1>
            <p className="mt-2 text-sm text-muted-foreground font-sans">
              The provider you requested may have been archived or moved.
            </p>
            <Button className="mt-6 btn-desk-primary" onClick={() => navigate("/tests")}>
              Back to Test Hub
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const open = (url: string) => {
    if (!isSafeUrl(url)) {
      toast({
        title: "Link blocked",
        description: "This URL isn't on the allowed list.",
        variant: "destructive",
      });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 max-w-5xl">
        <Link
          to="/tests"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Test Series Hub</span>
        </Link>

        {/* Hero Header */}
        <header className="relative overflow-hidden rounded-2xl border-2 border-border bg-card p-6 sm:p-8 md:p-10 shadow-[4px_4px_0px_var(--desk-border)]">
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <InstituteLogo
              id={provider.id}
              name={provider.name}
              logo={provider.logo}
              accent={provider.accent}
              className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl text-2xl border-2 border-border shadow-[3px_3px_0px_var(--desk-border)]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold">
                  <Library className="mr-1 h-3 w-3 text-primary" /> {provider.resources.length} test papers
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold border-primary/30 text-primary bg-primary/10">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified Institute
                </Badge>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                {provider.name}
              </h1>
              <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                {provider.description}
              </p>
            </div>
          </div>
        </header>

        {/* Resources Paper List */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Available Test Papers & Answer Keys ({provider.resources.length})
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">Direct Access</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {provider.resources.map((r, i) => (
              <button
                key={r.name + r.url}
                onClick={() => open(r.url)}
                className="group relative flex items-center justify-between gap-4 rounded-xl border-2 border-border bg-card hover:bg-muted p-4 text-left shadow-[2px_2px_0px_var(--desk-border)] hover:shadow-[4px_4px_0px_var(--desk-border)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-bold text-foreground truncate">
                      {r.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="block text-[11px] font-mono text-muted-foreground truncate">
                      {(() => {
                        try {
                          return new URL(r.url).hostname.replace(/^www\./, "");
                        } catch {
                          return "Portal Link";
                        }
                      })()}
                    </span>
                    {r.badge && (
                      <span className="inline-flex items-center rounded border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-primary">
                        {r.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-1.5 rounded-md border border-border bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-10 p-4 rounded-xl border border-border bg-muted/40 text-center font-mono text-[11px] text-muted-foreground">
          Notice: Bookie does not own or host test papers. All intellectual properties belong to their respective coaching institutions.
        </div>
      </div>
    </Layout>
  );
}