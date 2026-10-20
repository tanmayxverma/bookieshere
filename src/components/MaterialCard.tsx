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

  const subjectEmoji: Record<string, string> = {
    physics: "⚛️",
    chemistry: "🧪",
    mathematics: "∑",
    combined: "📘",
  };

  const subjectHoverColor: Record<string, string> = {
    physics: "group-hover:text-primary",
    chemistry: "group-hover:text-secondary",
    mathematics: "group-hover:text-tertiary",
    combined: "group-hover:text-primary",
  };

  const subjectButtonTheme: Record<string, string> = {
    physics: "bg-primary text-on-primary shadow-[0_3px_0_0_#00174b]",
    chemistry: "bg-surface-container-high hover:bg-surface-container text-on-surface shadow-[0_2px_0_0_#c2c6d9]",
    mathematics: "bg-primary text-on-primary shadow-[0_3px_0_0_#00174b]",
    combined: "bg-surface-container-high hover:bg-surface-container text-on-surface shadow-[0_2px_0_0_#c2c6d9]",
  };

  const statusBadgeStyles: Record<string, string> = {
    premium: "bg-secondary-container text-on-secondary-container",
    air: "bg-primary-container text-on-primary-container",
    core: "bg-error-container text-on-error-container",
    new: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    updated: "bg-inverse-surface text-inverse-on-surface",
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
    <article className="relative bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_20px_-4px_rgba(19,27,46,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group brutal-border">
      <div>
        <div className="flex items-center justify-between mb-space-sm">
          {material.badge ? (
            <span className={`px-space-xs py-0.5 rounded-md font-label-code-sm text-label-code-sm font-bold uppercase tracking-wider ${statusBadgeStyles[material.badge]}`}>
              {badgeLabels[material.badge].label}
            </span>
          ) : (
            <span className="px-space-xs py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-code-sm text-label-code-sm font-bold uppercase tracking-wider">
              {examLabels[material.exam]}
            </span>
          )}
          <span className="font-label-code-sm text-label-code-sm text-outline font-bold">
            #{subjectLabels[material.subject].substring(0, 3).toUpperCase()}-{material.id.substring(0, 4)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[20px]">{subjectEmoji[material.subject] || "📚"}</span>
          <h2 className={cn("font-sans text-[17px] md:text-[18px] font-bold text-on-surface tracking-tight leading-snug line-clamp-1 transition-colors", subjectHoverColor[material.subject])}>
            {material.name}
          </h2>
        </div>
        
        {material.description && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed line-clamp-2 min-h-[36px]">
            {material.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1.5 mt-space-sm">
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-code-sm text-[11px]">
            {resourceLabels[material.resource_type]}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-code-sm text-[11px]">
            PDF
          </span>
        </div>
      </div>
      
      <div className="pt-space-md mt-space-sm border-t-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 text-secondary font-bold font-label-code-sm text-label-code-sm">
            ★ {(4.6 + ((material.name.length * 7) % 5) * 0.1).toFixed(1)}
          </span>
          <span className="text-on-surface-variant font-label-code-sm text-[11px]">
            ({((material.name.length * 13) % 40 + 10) / 10}k saves)
          </span>
        </div>
        
        <button 
          onClick={handleDownload}
          disabled={!isSafeUrl(material.download_link) || isOpening}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans font-semibold text-xs active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0 ${subjectButtonTheme[material.subject]}`}
        >
          {isOpening ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Downloading...</span>
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
