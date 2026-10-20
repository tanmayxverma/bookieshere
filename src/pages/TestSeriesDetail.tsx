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
          <div className="inline-block p-8 rounded-2xl border border-border/80 bg-card shadow-xs max-w-md">
            <h1 className="font-serif text-2xl font-medium text-foreground">Test series not found</h1>
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              The provider you requested may have been archived or moved.
            </p>
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs font-semibold rounded-lg h-10 px-5 shadow-xs cursor-pointer" onClick={() => navigate("/tests")}>
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
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Test Series Hub</span>
        </Link>

        {/* Hero Header */}
        <header className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <InstituteLogo
              id={provider.id}
              name={provider.name}
              logo={provider.logo}
              accent={provider.accent}
              className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl text-2xl border border-border/70 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-semibold border-border/70">
                  <Library className="mr-1 h-3 w-3 text-primary" /> {provider.resources.length} test papers
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] uppercase font-semibold border-primary/20 text-primary bg-primary/10">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified Institute
                </Badge>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground leading-tight">
                {provider.name}
              </h1>
              <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed">
                {provider.description}
              </p>
            </div>
          </div>
        </header>

        {/* Resources Paper List */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Available Test Papers & Answer Keys ({provider.resources.length})
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">Direct Access Mirror</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {provider.resources.map((r, i) => (
              <button
                key={r.name + r.url}
                onClick={() => open(r.url)}
                className="group relative flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/40 p-4 text-left shadow-xs transition-all duration-200 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground/70 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
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
                      <span className="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold uppercase text-primary">
                        {r.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg border border-border/60 bg-muted/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-10 p-4 rounded-xl border border-border/60 bg-muted/30 text-center font-mono text-[11px] text-muted-foreground">
          Notice: Bookie does not host test papers. All intellectual properties belong to their respective coaching institutions.
        </div>
      </div>
    </Layout>
  );
}