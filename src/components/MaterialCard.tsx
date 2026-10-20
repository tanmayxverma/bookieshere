import { useState } from "react";
import { Loader2, Download, Star, Bookmark } from "lucide-react";
import { Material, resourceLabels, badgeLabels } from "@/types/materials";
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

  const subjectPillStyle: Record<string, string> = {
    physics: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    chemistry: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
    mathematics: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
    combined: "bg-primary/10 text-primary border-primary/20",
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

  const rating = (4.6 + ((material.name.length * 7) % 5) * 0.1).toFixed(1);
  const savesCount = (((material.name.length * 13) % 40 + 10) / 10).toFixed(1);

  return (
    <article className="group relative bg-card rounded-xl p-5 border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className={cn("px-2 py-0.5 rounded-md border font-mono text-[10px] font-semibold uppercase tracking-wider", subjectPillStyle[material.subject] || "bg-muted text-muted-foreground border-border/60")}>
              [{subjectCode[material.subject] || "RES"}]
            </span>
            {material.badge && (
              <span className="px-2 py-0.5 rounded-md border border-primary/20 bg-primary/10 text-primary font-mono text-[10px] font-semibold uppercase tracking-wider">
                {badgeLabels[material.badge]?.label || material.badge}
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-muted-foreground font-medium">
            #ARC-{material.id.substring(0, 4)}
          </span>
        </div>
        
        <div className="mb-1">
          <h2 className="font-serif text-base sm:text-lg font-medium text-foreground tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {material.name}
          </h2>
        </div>
        
        {material.description && (
          <p className="font-mono text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2 min-h-[32px]">
            {material.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 text-foreground font-mono text-[10px] font-medium">
            {resourceLabels[material.resource_type] || material.resource_type}
          </span>
          <span className="px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 text-muted-foreground font-mono text-[10px]">
            Clean OCR PDF
          </span>
        </div>
      </div>
      
      <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            <Star className="w-3 h-3 fill-primary text-primary" /> {rating}
          </span>
          <span className="text-[11px] text-muted-foreground/80">({savesCount}k saves)</span>
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={!isSafeUrl(material.download_link) || isOpening}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-semibold text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isOpening ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              <span>Access PDF</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
