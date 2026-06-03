import { useMemo, useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MathRenderer } from "@/components/MathRenderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Sparkles, BookOpen, Atom, Sigma, Bookmark, BookmarkCheck, Shuffle, RotateCw, ArrowLeft, ArrowRight } from "lucide-react";
import formulasData from "@/data/formulas.json";

type Formula = { subject: string; chapter: string; name: string; formula: string };
const ALL: Formula[] = formulasData as Formula[];

const SUBJECT_ICONS: Record<string, any> = {
  Physics: Atom,
  Chemistry: Sparkles,
  Mathematics: Sigma,
};

const BOOKMARK_KEY = "bookie:formula-bookmarks";

function useBookmarks() {
  const [ids, setIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]")); }
    catch { return new Set(); }
  });
  useEffect(() => {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...ids]));
  }, [ids]);
  const toggle = (id: string) => setIds((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  return { ids, toggle, has: (id: string) => ids.has(id) };
}

const formulaId = (f: Formula) => `${f.subject}::${f.chapter}::${f.name}`;

export default function Formulas() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>("All");
  const [chapter, setChapter] = useState<string>("All");
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [flashOpen, setFlashOpen] = useState(false);
  const bm = useBookmarks();

  const subjects = useMemo(() => ["All", ...Array.from(new Set(ALL.map((f) => f.subject)))], []);
  const chapters = useMemo(() => {
    const pool = subject === "All" ? ALL : ALL.filter((f) => f.subject === subject);
    return ["All", ...Array.from(new Set(pool.map((f) => f.chapter)))];
  }, [subject]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter((f) => {
      if (subject !== "All" && f.subject !== subject) return false;
      if (chapter !== "All" && f.chapter !== chapter) return false;
      if (bookmarksOnly && !bm.has(formulaId(f))) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.chapter.toLowerCase().includes(q) ||
        f.subject.toLowerCase().includes(q)
      );
    });
  }, [query, subject, chapter, bookmarksOnly, bm.ids]);

  // grouped by chapter for display
  const grouped = useMemo(() => {
    const map = new Map<string, Formula[]>();
    filtered.forEach((f) => {
      const k = `${f.subject} — ${f.chapter}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(f);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 md:py-14">
        {/* Hero */}
        <div className="text-center mb-8 md:mb-10">
          <Badge variant="secondary" className="mb-3 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> {ALL.length} curated formulas
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            JEE Formula Vault
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Physics · Chemistry · Mathematics. Beautifully typeset with KaTeX. Search any formula, filter by chapter, bookmark essentials, or grind through flashcards.
          </p>
        </div>

        {/* Controls */}
        <Card className="p-4 md:p-5 mb-6 liquid-glass-subtle">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by formula name, content, or chapter…"
                className="pl-9 h-11"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {subjects.map((s) => {
                const Icon = s === "All" ? BookOpen : SUBJECT_ICONS[s] || BookOpen;
                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={subject === s ? "default" : "outline"}
                    onClick={() => { setSubject(s); setChapter("All"); }}
                    className="rounded-full"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {s}
                  </Button>
                );
              })}
              <span className="mx-1 h-5 w-px bg-border" />
              <Button
                size="sm"
                variant={bookmarksOnly ? "default" : "outline"}
                onClick={() => setBookmarksOnly((v) => !v)}
                className="rounded-full"
              >
                <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                Bookmarks ({bm.ids.size})
              </Button>
              <Button
                size="sm"
                onClick={() => setFlashOpen(true)}
                className="rounded-full ml-auto"
                disabled={filtered.length === 0}
              >
                <Shuffle className="h-3.5 w-3.5 mr-1.5" /> Flashcards
              </Button>
            </div>
            {chapters.length > 2 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {chapters.map((c) => (
                  <button
                    key={c}
                    onClick={() => setChapter(c)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      chapter === c
                        ? "bg-primary/15 border-primary/40 text-foreground"
                        : "bg-background/60 border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        <div className="text-xs text-muted-foreground mb-4">
          Showing <span className="text-foreground font-medium">{filtered.length}</span> formulas
        </div>

        {grouped.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">No formulas match your filters.</Card>
        ) : (
          <div className="space-y-8">
            {grouped.map(([title, items]) => (
              <div key={title}>
                <h2 className="font-display text-lg md:text-xl font-semibold mb-3 text-foreground/90">
                  {title} <span className="text-muted-foreground font-normal text-sm">({items.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map((f) => {
                    const id = formulaId(f);
                    const isBm = bm.has(id);
                    return (
                      <Card key={id} className="p-4 group hover:border-primary/40 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-sm font-medium text-foreground">{f.name}</div>
                          <button
                            onClick={() => bm.toggle(id)}
                            className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Bookmark"
                          >
                            {isBm ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5 overflow-x-auto">
                          <MathRenderer formula={f.formula} className="text-base" />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Tip: bookmark your weakest formulas and revise them daily via flashcards.
        </p>
      </section>

      {flashOpen && (
        <FlashcardOverlay items={filtered} onClose={() => setFlashOpen(false)} bm={bm} />
      )}
    </Layout>
  );
}

function FlashcardOverlay({
  items, onClose, bm,
}: { items: Formula[]; onClose: () => void; bm: ReturnType<typeof useBookmarks> }) {
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = items[order[idx]];

  useEffect(() => { setFlipped(false); }, [idx]);

  const shuffle = () => {
    const arr = [...order];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr); setIdx(0); setFlipped(false);
  };

  const prev = () => setIdx((i) => (i - 1 + order.length) % order.length);
  const next = () => setIdx((i) => (i + 1) % order.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order.length]);

  if (!current) return null;
  const id = formulaId(current);
  const isBm = bm.has(id);

  return (
    <div className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary">{idx + 1} / {order.length}</Badge>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={shuffle} className="rounded-full">
              <Shuffle className="h-3.5 w-3.5 mr-1.5" /> Shuffle
            </Button>
            <Button size="sm" variant="outline" onClick={() => bm.toggle(id)} className="rounded-full">
              {isBm ? <BookmarkCheck className="h-3.5 w-3.5 mr-1.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5 mr-1.5" />}
              {isBm ? "Saved" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="rounded-full">Close</Button>
          </div>
        </div>

        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative h-80 cursor-pointer select-none"
          style={{ perspective: "1200px" }}
        >
          <div
            className="absolute inset-0 transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <Card
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 liquid-glass-subtle"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                {current.subject} · {current.chapter}
              </div>
              <div className="font-display text-2xl md:text-3xl font-semibold">{current.name}</div>
              <div className="mt-6 text-xs text-muted-foreground flex items-center gap-1.5">
                <RotateCw className="h-3 w-3" /> Tap or press space to reveal
              </div>
            </Card>
            {/* Back */}
            <Card
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 liquid-glass-subtle"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{current.name}</div>
              <div className="text-xl md:text-2xl overflow-x-auto max-w-full px-4">
                <MathRenderer formula={current.formula} display />
              </div>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={prev} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Previous
          </Button>
          <Button onClick={next} className="rounded-full">
            Next <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}