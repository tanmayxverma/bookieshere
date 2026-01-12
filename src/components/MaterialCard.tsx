import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Material, examLabels, subjectLabels, resourceLabels, badgeLabels } from "@/types/materials";
import { isSafeUrl } from "@/lib/urlValidation";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const [isOpening, setIsOpening] = useState(false);

  const subjectColors: Record<string, string> = {
    physics: "bg-physics text-white",
    chemistry: "bg-chemistry text-white",
    mathematics: "bg-mathematics text-white",
    combined: "bg-primary text-primary-foreground",
  };

  const examColors: Record<string, string> = {
    jee: "bg-jee text-white",
    other_pcm: "bg-other-exam text-white",
  };

  const badgeColors: Record<string, string> = {
    premium: "bg-amber-500 text-white",
    air: "bg-blue-600 text-white",
    core: "bg-orange-600 text-white",
  };

  const handleDownload = () => {
    if (isSafeUrl(material.download_link)) {
      setIsOpening(true);
      // Small delay to show loading state, then open link
      setTimeout(() => {
        window.open(material.download_link, "_blank", "noopener,noreferrer");
        setIsOpening(false);
      }, 300);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group card-glow border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {material.badge && (
            <Badge className={`${badgeColors[material.badge]} animate-pulse-soft`}>
              {badgeLabels[material.badge].icon} {badgeLabels[material.badge].label}
            </Badge>
          )}
          <Badge className={examColors[material.exam]}>
            {examLabels[material.exam]}
          </Badge>
          <Badge className={subjectColors[material.subject]}>
            {subjectLabels[material.subject]}
          </Badge>
          <Badge variant="outline">
            {resourceLabels[material.resource_type]}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-300">{material.name}</CardTitle>
        {material.description && (
          <CardDescription className="line-clamp-2">
            {material.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button
          className="w-full gap-2 btn-press transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
          onClick={handleDownload}
          disabled={!isSafeUrl(material.download_link) || isOpening}
        >
          {isOpening ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Access Resource
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
