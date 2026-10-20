import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Compass, BookOpen } from "lucide-react";
import { BookieEmblem } from "@/components/Brand/BookieEmblem";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-academic-grid text-foreground px-4 py-12">
      <div className="relative w-full max-w-md text-center">
        {/* Brand */}
        <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-8 group">
          <BookieEmblem size={36} className="transition-transform group-hover:scale-105" />
          <div className="flex items-baseline">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              BOOKIE
            </span>
            <span className="text-[10px] font-mono text-primary font-bold ml-0.5">®</span>
          </div>
        </Link>

        {/* Tactile 404 Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center mx-auto shadow-xs text-primary">
            <Compass className="w-7 h-7" />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase font-semibold text-primary border border-primary/20 px-2.5 py-0.5 rounded-full bg-primary/10">
              ROUTE NOT FOUND // 404
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-2.5">
              Lost in Transit
            </h1>
            <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              The chapter, paper, or carrel route <code className="font-mono text-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/60 text-[11px]">{location.pathname}</code> does not exist on this desk.
            </p>
          </div>

          <div className="pt-3 flex flex-col gap-2.5">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-sans font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Study Dashboard</span>
            </Link>
            <Link
              to="/ypt"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border/80 bg-card text-foreground font-sans font-semibold text-xs hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Launch Focus Timer</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
