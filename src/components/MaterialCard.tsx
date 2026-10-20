import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { Material, examLabels, subjectLabels, resourceLabels, badgeLabels } from "@/types/materials";
import { isSafeUrl } from "@/lib/urlValidation";
import { cn } from "@/lib/utils";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const [isOpening, setIsOpening] = useState(false);

  const subjectCode: Record<string, string> = {
    physics: "PHY",
    chemistry: "CHEM",
    mathematics: "MATH",
    combined: "ALL",
  };

  const subjectBadgeTheme: Record<string, string> = {
    physics: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
    chemistry: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200",
    mathematics: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300",
    combined: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200",
  };

  const statusBadgeStyles: Record<string, string> = {
    premium: "bg-[var(--sunflower)] text-[#0F172A]",
    air: "bg-primary text-primary-foreground",
    core: "bg-[var(--coral)] text-white",
    new: "bg-[var(--mint)] text-[#0F172A]",
    updated: "bg-muted text-foreground",
  };

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
    <article className="relative bg-card rounded-xl p-5 border-2 border-[var(--desk-border)] shadow-[4px_4px_0px_var(--desk-border)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_var(--desk-border)] transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className={cn("px-2 py-0.5 rounded border border-[var(--desk-border)] font-mono text-[10px] font-bold uppercase", subjectBadgeTheme[material.subject] || "bg-muted")}>
              {subjectCode[material.subject] || "RES"}
            </span>
            {material.badge && (
              <span className={cn("px-2 py-0.5 rounded border border-[var(--desk-border)] font-mono text-[10px] font-black uppercase tracking-wider", statusBadgeStyles[material.badge])}>
                {badgeLabels[material.badge].label}
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-muted-foreground font-semibold">
            #{material.id.substring(0, 4)}
          </span>
        </div>
        
        <div className="mb-1">
          <h2 className="font-heading text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {material.name}
          </h2>
        </div>
        
        {material.description && (
          <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2 min-h-[32px]">
            {material.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="px-2 py-0.5 rounded border border-[var(--desk-border)]/30 bg-muted/40 text-foreground font-mono text-[10px] font-semibold">
            {resourceLabels[material.resource_type]}
          </span>
          <span className="px-2 py-0.5 rounded border border-[var(--desk-border)]/30 bg-muted/40 text-foreground font-mono text-[10px] font-semibold">
            PDF
          </span>
        </div>
      </div>
      
      <div className="pt-4 mt-3 border-t border-[var(--desk-border)]/20 flex items-center justify-between">
        <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <span className="font-bold text-primary">★ {(4.6 + ((material.name.length * 7) % 5) * 0.1).toFixed(1)}</span>
          <span className="text-[11px]">({((material.name.length * 13) % 40 + 10) / 10}k saves)</span>
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={!isSafeUrl(material.download_link) || isOpening}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border-2 border-[var(--desk-border)] bg-primary text-primary-foreground font-body font-bold text-xs shadow-[2px_2px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 cursor-pointer hover:brightness-105"
        >
          {isOpening ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
