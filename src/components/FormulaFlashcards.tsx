import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MathRenderer } from "@/components/MathRenderer";
import {
  Sparkles, Search, Shuffle, RotateCw, Eye, EyeOff, Filter,
  Atom, Sigma, Beaker, ArrowRight,
} from "lucide-react";

type Formula = { subject: string; chapter: string; name: string; formula: string };

// Module-level cache so we only fetch the dataset once per session.
let CACHE: Formula[] | null = null;
let LOADING: Promise<Formula[]> | null = null;

async function loadFormulas(): Promise<Formula[]> {
  if (CACHE) return CACHE;
  if (LOADING) return LOADING;
  LOADING = import("@/data/formulas.json").then((m) => {
    CACHE = (m.default as Formula[]) || [];
    LOADING = null;
    return CACHE;
  });
  return LOADING;
}

const SUBJECT_ICON: Record<string, any> = {
  Physics: Atom,
  Chemistry: Beaker,
  Mathematics: Sigma,
};

function pickRandom<T>(arr: T[], not?: T): T {
  if (arr.length < 2) return arr[0];
  let pick = arr[Math.floor(Math.random() * arr.length)];
  let guard = 0;
  while (pick === not && guard++ < 5) pick = arr[Math.floor(Math.random() * arr.length)];
  return pick;
}

export function FormulaFlashcards() {
  const [current, setCurrent] = useState<Formula | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [subject, setSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const poolRef = useRef<Formula[]>([]);

  const drawNext = async () => {
    setLoading(true);
    const all = await loadFormulas();
    const pool = subject === "All" ? all : all.filter((f) => f.subject === subject);
    poolRef.current = pool;
    if (pool.length === 0) { setCurrent(null); setLoading(false); return; }
    setCurrent(pickRandom(pool, current ?? undefined));
    setRevealed(false);
    setLoading(false);
  };

  // Reset card when subject filter changes (if we already started).
  useEffect(() => {
    if (current) drawNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  const Icon = current ? SUBJECT_ICON[current.subject] || Sigma : Sparkles;

  return (
    <Card className="p-5 border-border/60 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/10 blur-3xl" />

      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-foreground/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Formula flashcards</h3>
            <p className="text-xs text-muted-foreground">Recall · Reveal · Repeat</p>
          </div>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Search formulas"
          aria-label="Search formulas"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Subject filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-3 relative">
        <Filter className="h-3.5 w-3.5 text-muted-foreground mr-0.5 self-center" />
        {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
              subject === s
                ? "bg-primary/15 border-primary/40 text-foreground"
                : "bg-background/60 border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Card stage */}
      {!current ? (
        <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center relative">
          <Sparkles className="h-7 w-7 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium mb-1">Quick formula revision</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[18rem] mx-auto">
            Recall the formula from its name, then flip the card to check. Lightweight & lazy-loaded.
          </p>
          <Button size="sm" onClick={drawNext} disabled={loading}>
            <Shuffle className="h-3.5 w-3.5 mr-1.5" />
            {loading ? "Loading…" : "Start flashcards"}
          </Button>
        </div>
      ) : (
        <div
          onClick={() => setRevealed((r) => !r)}
          className="relative cursor-pointer select-none rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/30 p-5 min-h-[170px] flex flex-col items-center justify-center text-center transition-transform active:scale-[0.99]"
          style={{ perspective: "900px" }}
        >
          <div
            className="w-full transition-transform duration-500"
            style={{ transformStyle: "preserve-3d", transform: revealed ? "rotateX(180deg)" : "rotateX(0deg)" }}
          >
            {!revealed ? (
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                  <Icon className="h-3 w-3" /> {current.subject} · {current.chapter}
                </Badge>
                <p className="font-display text-xl md:text-2xl font-bold tracking-tight leading-tight px-2">
                  {current.name}
                </p>
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-1">
                  <Eye className="h-3 w-3" /> Tap to reveal
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2" style={{ transform: "rotateX(180deg)" }}>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{current.name}</p>
                <div className="text-lg md:text-xl overflow-x-auto max-w-full px-2 py-1">
                  <MathRenderer formula={current.formula} display />
                </div>
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-1">
                  <EyeOff className="h-3 w-3" /> Tap to hide
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {current && (
        <div className="flex items-center gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setRevealed((r) => !r)}>
            <RotateCw className="h-3.5 w-3.5 mr-1.5" />
            {revealed ? "Hide" : "Reveal"}
          </Button>
          <Button size="sm" className="flex-1" onClick={drawNext} disabled={loading}>
            Next <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      )}

      <FormulaSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </Card>
  );
}

function FormulaSearchDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Formula[]>([]);
  const [ready, setReady] = useState(!!CACHE);

  useEffect(() => {
    if (!open) return;
    if (!CACHE) loadFormulas().then(() => setReady(true));
  }, [open]);

  useEffect(() => {
    if (!CACHE) { setResults([]); return; }
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const out: Formula[] = [];
    for (let i = 0; i < CACHE.length && out.length < 25; i++) {
      const f = CACHE[i];
      if (
        f.name.toLowerCase().includes(q) ||
        f.chapter.toLowerCase().includes(q)
      ) out.push(f);
    }
    setResults(out);
  }, [query, ready]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Search className="h-4 w-4" /> Search formulas
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ready ? "Formula name or chapter…" : "Loading database…"}
            className="pl-9 h-10"
            disabled={!ready}
          />
        </div>
        <div className="max-h-[55vh] overflow-y-auto -mx-1 px-1 mt-1">
          {query.trim() === "" ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Type a formula name or chapter to search.
            </p>
          ) : results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No matches.</p>
          ) : (
            <ul className="space-y-2">
              {results.map((f, i) => (
                <li key={`${f.subject}-${f.chapter}-${f.name}-${i}`} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold leading-tight">{f.name}</p>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{f.subject}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">{f.chapter}</p>
                  <div className="rounded-md bg-muted/40 border border-border/40 px-2 py-1.5 overflow-x-auto">
                    <MathRenderer formula={f.formula} className="text-sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}