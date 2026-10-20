import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Compass, BookOpen } from "lucide-react";
import logo from "@/assets/logo.png";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4 py-12">
      <div className="relative w-full max-w-md text-center">
        {/* Brand */}
        <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-8">
          <img
            src={logo}
            alt="BOOKIE"
            className="h-10 w-10 rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--desk-border)] object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <span className="font-display text-2xl font-black tracking-tight text-foreground">
            BOOKIE<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Tactile 404 Card */}
        <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-[6px_6px_0px_var(--desk-border)] space-y-4">
          <div className="w-14 h-14 rounded-xl border-2 border-border bg-muted flex items-center justify-center mx-auto shadow-[2px_2px_0px_var(--desk-border)]">
            <Compass className="w-7 h-7 text-primary" />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground border border-border px-2 py-0.5 rounded bg-muted">
              ROUTE NOT FOUND // 404
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground mt-2">
              Lost in Transit
            </h1>
            <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              The chapter, paper, or carrel route <code className="font-mono text-foreground bg-muted px-1 py-0.5 rounded text-[11px]">{location.pathname}</code> does not exist on this desk.
            </p>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-border bg-primary text-primary-foreground font-sans font-bold text-xs shadow-[2px_2px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Study Dashboard</span>
            </Link>
            <Link
              to="/ypt"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg border border-border bg-card text-foreground font-sans font-medium text-xs hover:bg-muted transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Launch Focus Timer</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
