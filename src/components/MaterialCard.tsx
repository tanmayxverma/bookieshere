import { useState } from "react";
import { ArrowRight, Loader2, Atom, FlaskConical, Sigma, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Material, examLabels, subjectLabels, resourceLabels, badgeLabels } from "@/types/materials";
import { isSafeUrl } from "@/lib/urlValidation";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const [isOpening, setIsOpening] = useState(false);

  const subjectIcon: Record<string, typeof Atom> = {
    physics: Atom,
    chemistry: FlaskConical,
    mathematics: Sigma,
    combined: BookOpen,
  };

  const subjectAccent: Record<string, string> = {
    physics: "text-physics",
    chemistry: "text-chemistry",
    mathematics: "text-mathematics",
    combined: "text-primary",
  };

  const subjectGlow: Record<string, string> = {
    physics: "bg-physics",
    chemistry: "bg-chemistry",
    mathematics: "bg-mathematics",
    combined: "bg-primary",
  };

  const subjectStripe: Record<string, string> = {
    physics: "from-physics/0 via-physics to-physics/0",
    chemistry: "from-chemistry/0 via-chemistry to-chemistry/0",
    mathematics: "from-mathematics/0 via-mathematics to-mathematics/0",
    combined: "from-primary/0 via-primary to-primary/0",
  };

  const statusBadgeStyles: Record<string, string> = {
    premium: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_12px_hsl(45_93%_47%/0.12)]",
    air: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    core: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    new: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_hsl(160_84%_39%/0.15)]",
    updated: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  const Icon = subjectIcon[material.subject] ?? BookOpen;

  const handleDownload = () => {
    if (isSafeUrl(material.download_link)) {
      setIsOpening(true);
      setTimeout(() => {
        window.open(material.download_link, "_blank", "noopener,noreferrer");
        setIsOpening(false);
      }, 300);
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden transition-all duration-500 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-15px_hsl(var(--primary)/0.25)]">
      {/* Subject accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${subjectStripe[material.subject]} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="flex flex-col flex-1 p-6">
        {/* Status badge tier */}
        {material.badge && (
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${statusBadgeStyles[material.badge]}`}>
              {badgeLabels[material.badge].icon} {badgeLabels[material.badge].label}
            </span>
          </div>
        )}

        {/* Identity row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1 min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${subjectAccent[material.subject]}`}>
              {subjectLabels[material.subject]} • {examLabels[material.exam]}
            </p>
            <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
              {material.name}
            </h3>
          </div>
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 ${subjectGlow[material.subject]} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            <div className="relative w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Icon className={`w-6 h-6 ${subjectAccent[material.subject]}`} />
            </div>
          </div>
        </div>

        {/* Description */}
        {material.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">
            {material.description}
          </p>
        )}

        {/* Resource type pill */}
        <div className="flex items-center gap-2 mb-6 mt-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-foreground/[0.04] text-muted-foreground border border-border/40">
            {resourceLabels[material.resource_type]}
          </span>
        </div>

        {/* CTA */}
        <Button
          onClick={handleDownload}
          disabled={!isSafeUrl(material.download_link) || isOpening}
          className="relative w-full h-12 rounded-2xl font-bold overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_20px_-5px_hsl(var(--primary)/0.4)] transition-all duration-300 group/btn"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isOpening ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                Access Resource
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </>
            )}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
        </Button>
      </div>
    </div>
  );
}
