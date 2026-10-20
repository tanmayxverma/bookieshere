import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, FileText, Timer, Video, CheckCircle2, 
  ArrowRight, Copy, ExternalLink, ShieldCheck, Pin
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { JEECountdown } from "@/components/JEECountdown";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Index() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || "";

  // ───── Signature Interactive Desk Timer State ─────
  const [selectedSubject, setSelectedSubject] = useState("Physics: Rotational Dynamics");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(26130); // 07:15:30 default

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handlePunchIn = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
      toast.success("Immersion Punch-In Recorded!", {
        description: `Timer started for ${selectedSubject}`,
      });
    } else {
      setIsTimerRunning(false);
      toast.info("Immersion Session Paused");
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("9906DZRL");
    toast.success("Code copied: 9906DZRL", {
      description: "10% off on PhysicsWallah batches applied",
    });
  };

  return (
    <Layout>
      <div className="w-full text-foreground overflow-x-hidden selection:bg-[var(--sunflower)] selection:text-[#0F172A]">
        
        {/* Micro Top Ticker Strip */}
        <div className="w-full bg-[var(--sunflower)] border-b-2 border-[var(--desk-border)] py-1 px-4 flex justify-between items-center text-[#0F172A] font-mono text-xs tracking-wider font-semibold overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0F172A] animate-pulse"></span>
            <span>BOOKIE ACADEMICS • BATCH 2025 • PROCTORED IMMERSION ENGINE ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <span>LATENCY: 14MS</span>
            <span className="text-[#0F172A]/40">|</span>
            <span>TCS iON MIRROR V4.2</span>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 space-y-16">
          
          {/* ───── HERO SECTION: Split Screen Momentum ───── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start" id="home">
            {/* Left Column: Philosophy, Clear Hierarchy, Single Primary Action */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 bg-[var(--mint-light)] text-[var(--mint-dark)] px-3.5 py-1 rounded-full border-2 border-[var(--desk-border)] shadow-[2px_2px_0px_var(--desk-border)] -rotate-1 select-none">
                <ShieldCheck className="w-4 h-4 text-[var(--mint-dark)]" />
                <span className="font-mono text-xs font-bold tracking-wider uppercase">
                  {firstName ? `WELCOME, ${firstName.toUpperCase()} • ` : ""}ANTI-BURNOUT FOCUS PROTOCOL
                </span>
              </div>

              {/* Display Headline */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight leading-[1.05] text-foreground uppercase">
                  Crack the exam. <br />
                  Keep your <span className="relative inline-block text-primary">
                    sanity.
                    <svg className="absolute -bottom-1.5 left-0 w-full" fill="none" height="12" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9C50 3 150 2 197 9" stroke="#FBBF24" strokeLinecap="round" strokeWidth="6"></path>
                    </svg>
                  </span>
                </h1>
              </div>

              <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                Stripped of mindless gamification and daytime distraction loops. Engineered for uninterrupted 6-to-10 hour deep immersion blocks with verbatim TCS iON mock setups, silent desk webcams, and 10-year deconstructed PYQs.
              </p>

              {/* Stats Ribbon in 3 Tactile Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="bg-card p-3.5 border-2 border-[var(--desk-border)] rounded-xl shadow-[3px_3px_0px_var(--desk-border)]">
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-primary">4.8M+</div>
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">Questions Solved</div>
                </div>
                <div className="bg-card p-3.5 border-2 border-[var(--desk-border)] rounded-xl shadow-[3px_3px_0px_var(--desk-border)]">
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--mint-dark)]">99.4%</div>
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">IIT/AIIMS Conversion</div>
                </div>
                <div className="bg-card p-3.5 border-2 border-[var(--desk-border)] rounded-xl shadow-[3px_3px_0px_var(--desk-border)]">
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground">3,420</div>
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">Live on Silent Desks</div>
                </div>
              </div>

              {/* Single Primary Action + Secondary Clear Route */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/ypt"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-[var(--desk-border)] bg-primary text-primary-foreground font-body font-bold text-sm sm:text-base uppercase tracking-wider shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all hover:brightness-105 text-center"
                >
                  <Timer className="w-5 h-5" />
                  <span>ENTER PROCTORED CARREL →</span>
                </Link>
                <Link
                  to="/materials"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[var(--desk-border)] bg-card text-foreground font-body font-bold text-sm sm:text-base uppercase tracking-wider shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all hover:bg-muted text-center"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>BROWSE MATERIALS</span>
                </Link>
              </div>

              {/* Quick Proof Quote */}
              <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-muted-foreground italic border-t border-[var(--desk-border)]/20 pt-4">
                <span className="text-xl not-italic font-bold text-primary">“</span>
                <p>
                  No streaks, no leaderboards, no fireworks. Just raw hours with the notebook. Scored AIR 142 in Adv 2024.
                  <span className="block not-italic font-mono text-xs text-primary font-bold mt-0.5">— T. Karthik, IIT Bombay CSE</span>
                </p>
              </div>
            </div>

            {/* Right Column: Signature Interactive Tactile Study Desk Station */}
            <div className="lg:col-span-5 relative">
              <div className="bg-card border-2 border-[var(--desk-border)] p-6 sm:p-7 rounded-2xl relative shadow-[5px_5px_0px_var(--desk-border)]">
                {/* Washi Header Indicator */}
                <div className="washi-tape bg-[var(--sunflower)] text-[#0F172A] -rotate-1">
                  STATION: CARREL-EAST-042
                </div>

                <div className="flex justify-between items-center pt-2 mb-4">
                  <span className="font-mono text-xs font-bold flex items-center gap-1.5 text-[var(--mint-dark)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--mint)] animate-ping"></span>
                    PROCTOR WEBCAM ACTIVE
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-[var(--desk-border)]">
                    SILENT MODE
                  </span>
                </div>

                {/* Tilted Sticky Note */}
                <div className="bg-amber-100 dark:bg-amber-950/60 p-4 border-2 border-[var(--desk-border)] rounded-xl shadow-[3px_3px_0px_var(--desk-border)] -rotate-1 mb-5 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[var(--coral)]">
                    <Pin className="w-5 h-5 fill-current" />
                  </div>
                  <p className="font-mono text-xs font-bold text-amber-950 dark:text-amber-200 leading-relaxed pt-1">
                    "Rotation &amp; Thermodynamics today. 45 min deep blocks, zero phone in room. We don't chase dopamine, we build rank."
                  </p>
                  <div className="text-right font-mono text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-2 font-semibold">
                    — Desk Target: 8h 30m
                  </div>
                </div>

                {/* Chunky Navy/OLED Timer LCD Block */}
                <div className="bg-[#0F172A] dark:bg-[#0A0E17] border-2 border-[var(--desk-border)] rounded-xl p-5 text-white shadow-inner mb-5">
                  <div className="flex justify-between items-center font-mono text-xs text-slate-400 mb-1">
                    <span>ELAPSED IMMERSION</span>
                    <span className="text-[var(--mint)] font-bold">
                      {isTimerRunning ? "ACTIVE TRACKING" : "IDLE / PAUSED"}
                    </span>
                  </div>
                  <div className="font-mono font-extrabold text-4xl sm:text-5xl text-[var(--mint)] tracking-wider py-1 font-tabular">
                    {formatTimer(secondsElapsed)}
                  </div>
                  {/* Progress Meter */}
                  <div className="mt-3">
                    <div className="flex justify-between font-mono text-xs text-slate-300 mb-1.5">
                      <span>Target: 09h 00m</span>
                      <span className="font-bold text-white">80% Achieved</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 border border-slate-700 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-[var(--mint)] rounded-full w-4/5 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>

                {/* Subject Selector Pills */}
                <div className="space-y-2 mb-5">
                  <div className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Select Immersion Module:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Physics: Rotational Dynamics",
                      "Chemistry: Organic Synthesis",
                      "Maths: Coordinate Geometry"
                    ].map((subject) => {
                      const isSelected = selectedSubject === subject;
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => setSelectedSubject(subject)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border-2 border-[var(--desk-border)] font-mono text-xs font-bold transition-all cursor-pointer",
                            isSelected
                              ? "bg-[var(--sunflower)] text-[#0F172A] shadow-[2px_2px_0px_var(--desk-border)]"
                              : "bg-muted/40 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {isSelected && <span className="inline-block w-2 h-2 rounded-full bg-[#0F172A] mr-1.5"></span>}
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Signature Tactile Action Button */}
                <button
                  type="button"
                  onClick={handlePunchIn}
                  className={cn(
                    "w-full py-3.5 px-6 rounded-xl border-2 border-[var(--desk-border)] font-heading text-base font-bold flex items-center justify-center gap-3 tracking-wide shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer",
                    isTimerRunning
                      ? "bg-[var(--coral)] text-white hover:brightness-105"
                      : "bg-primary text-primary-foreground hover:brightness-105"
                  )}
                >
                  <span>{isTimerRunning ? "PAUSE IMMERSION" : "PUNCH IN FOR STUDY"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center font-mono text-xs text-muted-foreground mt-3">
                  Peer feeds active • Microphones muted • 100% focused
                </p>
              </div>

              {/* Coupon Box Card */}
              <div className="mt-4 bg-card border-2 border-[var(--desk-border)] rounded-xl p-4 shadow-[3px_3px_0px_var(--desk-border)] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] font-bold text-primary uppercase">PW BATCH DISCOUNT</span>
                  <div className="font-mono font-black text-sm text-foreground">CODE: 9906DZRL</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="p-2 rounded-lg border-2 border-[var(--desk-border)] bg-muted/60 hover:bg-muted text-foreground transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                    title="Copy Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href="https://physicswallah.onelink.me/ZAZB/km5qwl9y"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] font-mono text-xs font-bold shadow-[1.5px_1.5px_0px_var(--desk-border)] hover:brightness-105"
                  >
                    <span>10% OFF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ───── JEE COUNTDOWN TELEMETRY MODULE ───── */}
          <JEECountdown />

          {/* ───── WORKBENCH CAPABILITIES: Bento 3-Column Grid ───── */}
          <section className="space-y-6 pt-4" id="capabilities">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[var(--desk-border)] pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
                  WORKBENCH CAPABILITIES
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mt-1">
                  Engineered for High-Scoring Precision
                </h2>
              </div>
              <p className="font-body text-sm text-muted-foreground max-w-md">
                Zero vanity streaks. Every module is modeled strictly on NTA/IIT JEE examination psychology and cognitive pacing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Module 01: Silent Study Rooms */}
              <div className="bg-card border-2 border-[var(--desk-border)] p-6 rounded-2xl relative flex flex-col justify-between shadow-[4px_4px_0px_var(--desk-border)]">
                <div className="washi-tape bg-blue-100 dark:bg-blue-950 text-primary -rotate-2">
                  ROOM 4B • 84/100 OCCUPIED
                </div>
                <div className="pt-4 space-y-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-[var(--desk-border)] bg-primary/10 flex items-center justify-center text-primary shadow-[2px_2px_0px_var(--desk-border)]">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground">Interactive Silent Rooms</h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    Silent proctored carrels with live peer feeds &amp; zero chatter. Hear only mechanical keyboards and flipping pages.
                  </p>
                  
                  {/* Peer Feeds Micro-List */}
                  <div className="space-y-2 pt-2 border-t border-[var(--desk-border)]/20 font-mono text-xs">
                    <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-[var(--desk-border)]/30">
                      <span className="font-bold text-foreground">@anirudh_iitd</span>
                      <span className="text-[var(--mint-dark)]">06h 12m • Wave Optics</span>
                    </div>
                    <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-[var(--desk-border)]/30">
                      <span className="font-bold text-foreground">@meera_aiims</span>
                      <span className="text-[var(--mint-dark)]">08h 44m • Organic Chem</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <Link
                    to="/ypt"
                    className="block text-center rounded-lg border-2 border-[var(--desk-border)] bg-primary text-primary-foreground py-2.5 px-4 font-body text-sm font-bold shadow-[2px_2px_0px_var(--desk-border)] hover:brightness-105 transition-all"
                  >
                    Join Live Chamber →
                  </Link>
                </div>
              </div>

              {/* Module 02: 10-Year Solved PYQ Vault */}
              <div className="bg-card border-2 border-[var(--desk-border)] p-6 rounded-2xl relative flex flex-col justify-between shadow-[4px_4px_0px_var(--desk-border)]">
                <div className="washi-tape bg-[var(--sunflower)] text-[#0F172A] rotate-1">
                  2014-2024 DECONSTRUCTED
                </div>
                <div className="pt-4 space-y-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-[var(--desk-border)] bg-[var(--sunflower)] flex items-center justify-center text-[#0F172A] shadow-[2px_2px_0px_var(--desk-border)]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground">10-Year Solved PYQ Vault</h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    Step-by-step first-principle proofs, trap taxonomy, and negative-mark danger zones documented by top rankers.
                  </p>
                  
                  {/* High Yield Weightage Tags */}
                  <div className="space-y-2 pt-2 border-t border-[var(--desk-border)]/20">
                    <span className="font-mono text-xs font-bold text-muted-foreground block uppercase">HIGH YIELD WEIGHTAGE:</span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                      <span className="bg-muted px-2 py-0.5 rounded border border-[var(--desk-border)] font-semibold">
                        Wave Optics 11.2%
                      </span>
                      <span className="bg-[var(--sunflower)] text-[#0F172A] px-2 py-0.5 rounded border border-[var(--desk-border)] font-bold">
                        Carbonyls 14.8%
                      </span>
                      <span className="bg-muted px-2 py-0.5 rounded border border-[var(--desk-border)] font-semibold">
                        Calculus 18.4%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <Link
                    to="/materials"
                    className="block text-center rounded-lg border-2 border-[var(--desk-border)] bg-[var(--sunflower)] text-[#0F172A] py-2.5 px-4 font-body text-sm font-bold shadow-[2px_2px_0px_var(--desk-border)] hover:brightness-105 transition-all"
                  >
                    Inspect PYQ Matrix →
                  </Link>
                </div>
              </div>

              {/* Module 03: TCS iON CBT Exam Simulator */}
              <div className="bg-card border-2 border-[var(--desk-border)] p-6 rounded-2xl relative flex flex-col justify-between shadow-[4px_4px_0px_var(--desk-border)]">
                <div className="washi-tape bg-[var(--mint-light)] text-[var(--mint-dark)] -rotate-1">
                  VERBATIM NTA ENGINE
                </div>
                <div className="pt-4 space-y-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-[var(--desk-border)] bg-[var(--mint-light)] flex items-center justify-center text-[var(--mint-dark)] shadow-[2px_2px_0px_var(--desk-border)]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground">TCS iON CBT Simulator</h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">
                    Exact reproduction of the testing software down to question palette latency, button clicks, and rough-sheet pacing.
                  </p>
                  
                  {/* Palette Key Grid */}
                  <div className="pt-2 border-t border-[var(--desk-border)]/20 space-y-1.5 font-mono text-xs">
                    <span className="font-bold text-muted-foreground block uppercase">EXAM PALETTE KEY:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded border border-[var(--desk-border)]/30">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[var(--mint)]"></span>
                        <span>01 Ans: Green</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded border border-[var(--desk-border)]/30">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[var(--coral)]"></span>
                        <span>02 Unans: Red</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <Link
                    to="/tests"
                    className="block text-center rounded-lg border-2 border-[var(--desk-border)] bg-[var(--mint-dark)] text-white py-2.5 px-4 font-body text-sm font-bold shadow-[2px_2px_0px_var(--desk-border)] hover:brightness-105 transition-all"
                  >
                    Launch Test Engine →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ───── DAILY ASPIRANT HALL OF FAME: Tabular Ledger ───── */}
          <section className="space-y-4 pt-4" id="ledger">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[var(--desk-border)] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                    Daily Aspirant Hall of Fame
                  </h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-[var(--desk-border)] bg-[var(--mint-light)] text-[var(--mint-dark)] rotate-1">
                    DISCIPLINE LEDGER
                  </span>
                </div>
                <p className="font-body text-sm text-muted-foreground mt-0.5">
                  Ranked strictly by verified proctored immersion • Zero vanity XP
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--mint)] animate-pulse"></span>
                <span>Live Audit: All Feeds Clean</span>
              </div>
            </div>

            {/* Tabular Ledger Card */}
            <div className="bg-card border-2 border-[var(--desk-border)] rounded-2xl overflow-x-auto shadow-[4px_4px_0px_var(--desk-border)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/60 border-b-2 border-[var(--desk-border)] font-mono text-xs text-foreground uppercase tracking-wider">
                    <th className="p-3.5 pl-6">RANK</th>
                    <th className="p-3.5">ASPIRANT</th>
                    <th className="p-3.5">TARGET TRACK</th>
                    <th className="p-3.5">TODAY'S IMMERSION</th>
                    <th className="p-3.5">ACCURACY</th>
                    <th className="p-3.5">FOCUS DECK</th>
                    <th className="p-3.5 pr-6 text-right">AUDIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[var(--desk-border)]/15 text-sm font-body">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold">
                      <span className="inline-block bg-[var(--sunflower)] text-[#0F172A] px-2 py-0.5 rounded border border-[var(--desk-border)] font-extrabold shadow-[1px_1px_0px_var(--desk-border)]">
                        #01
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      Aarav S.
                      <span className="block font-mono text-xs text-muted-foreground font-normal">Kota Carrel #14</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-[var(--desk-border)] bg-primary/10 text-primary">
                        IIT-B CSE Track
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[var(--mint-dark)] font-tabular">
                      11h 42m logged
                    </td>
                    <td className="p-3.5 font-mono font-semibold font-tabular">
                      96.4%
                    </td>
                    <td className="p-3.5 text-foreground/80 font-medium">
                      Thermodynamics &amp; Fluids
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--desk-border)] bg-[var(--mint-light)] text-[var(--mint-dark)] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold">
                      <span className="inline-block bg-muted px-2 py-0.5 rounded border border-[var(--desk-border)] font-extrabold shadow-[1px_1px_0px_var(--desk-border)]">
                        #02
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      Priyanshu M.
                      <span className="block font-mono text-xs text-muted-foreground font-normal">Delhi Silent Hall</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-[var(--desk-border)] bg-muted text-foreground">
                        AIIMS New Delhi
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[var(--mint-dark)] font-tabular">
                      10h 58m logged
                    </td>
                    <td className="p-3.5 font-mono font-semibold font-tabular">
                      98.1%
                    </td>
                    <td className="p-3.5 text-foreground/80 font-medium">
                      Molecular Genetics
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--desk-border)] bg-[var(--mint-light)] text-[var(--mint-dark)] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-6 font-mono font-bold">
                      <span className="inline-block bg-muted px-2 py-0.5 rounded border border-[var(--desk-border)] font-extrabold shadow-[1px_1px_0px_var(--desk-border)]">
                        #03
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      Ananya V.
                      <span className="block font-mono text-xs text-muted-foreground font-normal">Hyderabad Desk #09</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-[var(--desk-border)] bg-primary/10 text-primary">
                        IIT-D Electrical
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[var(--mint-dark)] font-tabular">
                      10h 24m logged
                    </td>
                    <td className="p-3.5 font-mono font-semibold font-tabular">
                      94.2%
                    </td>
                    <td className="p-3.5 text-foreground/80 font-medium">
                      Complex Numbers &amp; Vectors
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--desk-border)] bg-[var(--mint-light)] text-[var(--mint-dark)] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ───── HIGH-ENERGY CLOSING BANNER & CREED ───── */}
          <section className="bg-[var(--sunflower)] border-2 border-[var(--desk-border)] p-8 md:p-12 rounded-2xl text-[#0F172A] relative overflow-hidden shadow-[6px_6px_0px_var(--desk-border)]">
            <div className="washi-tape bg-white text-[#0F172A] -rotate-1">
              THE BOOKIE MANIFESTO // 2025
            </div>

            <div className="max-w-3xl space-y-6 pt-2">
              <div className="inline-block bg-[#0F172A] text-white px-3 py-1 rounded-md font-mono text-xs font-bold tracking-wider">
                ANTI-DOPAMINE PLEDGE
              </div>

              <blockquote className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-[#0F172A] leading-snug">
                “Exams are not won through cheap dopamine. They are won through quiet, relentless conviction and thousands of solitary hours facing the unsolved page.”
              </blockquote>

              <p className="font-body text-base text-[#0F172A]/85 max-w-xl font-medium">
                Join 3,400+ serious aspirants logged in today. Close the algorithm. Open the drafting desk.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-3">
                <Link
                  to="/ypt"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[var(--desk-border)] bg-white hover:bg-slate-50 text-[#0F172A] font-body text-base font-bold shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Timer className="w-5 h-5 text-primary" />
                  <span>ENTER PROCTORED CARREL</span>
                </Link>
                <Link
                  to="/materials"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[var(--desk-border)] bg-primary hover:brightness-105 text-white font-body text-base font-bold shadow-[3px_3px_0px_var(--desk-border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>DOWNLOAD FORMULA PACK (PDF)</span>
                </Link>
              </div>
            </div>
          </section>

        </main>
      </div>
    </Layout>
  );
}
