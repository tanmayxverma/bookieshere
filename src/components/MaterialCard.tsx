import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Material, examLabels, subjectLabels, resourceLabels } from "@/types/materials";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const subjectColors: Record<string, string> = {
    physics: "bg-physics text-white",
    chemistry: "bg-chemistry text-white",
    mathematics: "bg-mathematics text-white",
  };

  const examColors: Record<string, string> = {
    jee: "bg-jee text-white",
    other_pcm: "bg-other-exam text-white",
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
          onClick={() => window.open(material.download_link, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-4 w-4" />
          Download / Open Link
        </Button>
      </CardContent>
    </Card>
  );
}