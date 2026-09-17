import { useMemo, useState } from "react";
import { Star, Target, AlertTriangle, RotateCcw } from "lucide-react";
import { SYLLABUS, MAX_STARS, type SyllabusSubject } from "@/data/jeeSyllabus";
import { useSyllabusTracker } from "@/hooks/useSyllabusTracker";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function subjectStats(subject: SyllabusSubject, stars: Record<string, number>) {
  const chapters = subject.groups.flatMap((g) => g.chapters);
  const total = chapters.length * MAX_STARS;
  const earned = chapters.reduce((sum, c) => sum + Math.min(MAX_STARS, stars[c.key] || 0), 0);
  const percent = total ? Math.round((earned / total) * 100) : 0;
  const weak = chapters.filter((c) => (stars[c.key] || 0) <= 1 && (stars[c.key] || 0) >= 0);
  return { percent, weak, chapters };
}

function StarRow({ value, onSelect }: { value: number; onSelect: (stars: number) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border/40 bg-muted/20">
      {[1, 2, 3].map((starIdx) => {
        const isFilled = starIdx <= value;
        return (
          <button
            key={starIdx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // If clicking current star rating, reset to 0; otherwise set directly to starIdx
              onSelect(value === starIdx ? 0 : starIdx);
            }}
            className={`p-1 rounded-md transition-all active:scale-90 hover:bg-muted ${
              isFilled ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground/30 hover:text-muted-foreground/70'
            }`}
            title={`Set to ${starIdx} star${starIdx > 1 ? 's' : ''}${value === starIdx ? ' (click again to clear)' : ''}`}
            aria-label={`${starIdx} of 3 stars`}
          >
            <Star
              className={`h-3.5 w-3.5 transition-transform ${
                isFilled ? 'fill-amber-400 text-amber-500 scale-105' : 'fill-none'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function YPTTracker() {
  const { stars, setStar, resetAll, overall } = useSyllabusTracker();
  const [openSubject, setOpenSubject] = useState<string | null>("physics");

  const subjectStatsAll = useMemo(
    () => SYLLABUS.map((s) => ({ subject: s, ...subjectStats(s, stars) })),
    [stars]
  );

  return (
    <div className="space-y-5 pop-in">
      {/* Header + overall */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              <Target className="h-3 w-3 text-primary" /> Syllabus Tracker
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight">Overall Preparation</h2>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                <AlertDialogDescription>This clears every star across Physics, Chemistry, and Maths. You can't undo it.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAll}>Yes, reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-display font-black tabular-nums">{overall}%</span>
          <span className="text-xs text-muted-foreground">complete</span>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${overall}%` }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" /><Star className="h-3 w-3 fill-primary text-primary" /><Star className="h-3 w-3 fill-primary text-primary" /> Fully done</span>
          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" /><Star className="h-3 w-3 fill-primary text-primary" /><Star className="h-3 w-3 text-muted-foreground/40" /> Revision pending</span>
          <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" /><Star className="h-3 w-3 text-muted-foreground/40" /><Star className="h-3 w-3 text-muted-foreground/40" /> Weak / just started</span>
        </div>
      </div>

      {/* Subject cards */}
      <div className="space-y-3">
        {subjectStatsAll.map(({ subject, percent, weak }) => {
          const isOpen = openSubject === subject.id;
          return (
            <div key={subject.id} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => setOpenSubject(isOpen ? null : subject.id)}
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-surface-2/30 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-display font-bold text-base">{subject.name}</h3>
                    <span className="text-xs text-muted-foreground tabular-nums">{percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{isOpen ? "Hide" : "Open"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-border/40 divide-y divide-border/30">
                  {weak.length > 0 && (
                    <div className="p-4 bg-amber-500/5">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1.5">
                        <AlertTriangle className="h-3 w-3" /> Weak chapters ({weak.length})
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {weak.slice(0, 6).map((w) => w.name).join(" · ")}{weak.length > 6 ? " …" : ""}
                      </p>
                    </div>
                  )}
                  {subject.groups.map((group) => (
                    <div key={group.label} className="p-4">
                      <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">
                        {group.label}
                      </div>
                      <div className="space-y-0.5">
                        {group.chapters.map((c) => {
                          const v = stars[c.key] || 0;
                          return (
                            <div key={c.key} className="flex items-center justify-between gap-2 py-1.5 px-1 rounded-md hover:bg-surface-2/40 transition-colors">
                              <span className={`text-sm truncate ${v >= 3 ? "text-foreground" : v >= 1 ? "text-foreground/90" : "text-muted-foreground"}`}>
                                {c.name}
                              </span>
                              <StarRow value={v} onSelect={(newVal) => setStar(c.key, newVal)} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-center text-muted-foreground/70">
        Progress is saved on this device. Inactive data auto-clears after 3 months.
      </p>
    </div>
  );
}