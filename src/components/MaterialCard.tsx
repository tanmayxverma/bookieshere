import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Material, examLabels, subjectLabels, resourceLabels } from "@/types/materials";

interface MaterialCardProps {
  material: Material;
}

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export function MaterialCard({ material }: MaterialCardProps) {
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

  const handleDownload = () => {
    if (isSafeUrl(material.download_link)) {
      window.open(material.download_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 mb-2">
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
        <CardTitle className="text-lg leading-tight">{material.name}</CardTitle>
        {material.description && (
          <CardDescription className="line-clamp-2">
            {material.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button
          className="w-full gap-2"
          onClick={handleDownload}
          disabled={!isSafeUrl(material.download_link)}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardContent>
    </Card>
  );
}
