import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const handwrittenNotes = [
  {
    title: "AIR 118 – IIT Delhi Handwritten Notes",
    description: "All Subjects (Physics • Chemistry • Mathematics)",
    searchTerms: ["air 118", "iit delhi", "handwritten", "notes", "physics", "chemistry", "mathematics", "all subjects"],
    links: [
      { label: "Download All", url: "https://linkpays.in/POwZaAK" }
    ]
  },
  {
    title: "AIR 42 – IIT Bombay Handwritten Notes",
    description: "Subject-wise notes",
    searchTerms: ["air 42", "iit bombay", "handwritten", "notes", "physics", "chemistry", "mathematics", "subject-wise"],
    links: [
      { label: "Physics", url: "https://linkpays.in/qOa1y9h" },
      { label: "Mathematics", url: "https://linkpays.in/zMdAAoQ" },
      { label: "Chemistry", url: "https://linkpays.in/Xf8IpVk" }
    ]
  }
];

interface HandwrittenNotesProps {
  searchQuery?: string;
}

export function HandwrittenNotes({ searchQuery = "" }: HandwrittenNotesProps) {
  const handleDownload = (url: string) => {
    if (isSafeUrl(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return handwrittenNotes;
    
    const query = searchQuery.toLowerCase();
    return handwrittenNotes.filter((note) => 
      note.title.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query) ||
      note.searchTerms.some(term => term.includes(query))
    );
  }, [searchQuery]);

  if (filteredNotes.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Handwritten Notes
        </h2>
        <p className="text-muted-foreground text-sm">
          Top ranker handwritten notes for JEE preparation.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredNotes.map((note, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg text-foreground">
                {note.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{note.description}</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {note.links.map((link, linkIndex) => (
                  <Button
                    key={linkIndex}
                    size="sm"
                    variant={note.links.length === 1 ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => handleDownload(link.url)}
                    disabled={!isSafeUrl(link.url)}
                  >
                    <Download className="h-3 w-3" />
                    {link.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
