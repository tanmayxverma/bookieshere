import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, FileText, Timer, ArrowRight, ShieldCheck, 
  ExternalLink, CheckCircle2, ChevronRight
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { JEECountdown } from "@/components/JEECountdown";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChapterTrap {
  name: string;
  sub: string;
  weightage: string;
  negativeRate: string;
  trapNotes: string;
  link: string;
}

const chaptersBySubject: Record<string, ChapterTrap[]> = {
  Physics: [
    {
      name: "Rotational Dynamics & Rigid Bodies",
      sub: "Physics // Mechanics & CM Frame Multi-Mass",
      weightage: "12.4%",
      negativeRate: "-2: 41.2%",
      trapNotes: "Incorrect torque axis choice about non-inertial points without fictitious force correction.",
      link: "/materials",
    },
    {
      name: "Electrodynamics & Induction Geometry",
      sub: "Physics // Maxwell Equations & Motional EMF",
      weightage: "10.8%",
      negativeRate: "-2: 34.6%",
      trapNotes: "Lenz law sign errors in rotating non-uniform magnetic loops.",
      link: "/materials",
    },
    {
      name: "Wave Optics & Thin Film Interference",
      sub: "Physics // Physical Optics & Phase Shifts",
      weightage: "7.2%",
      negativeRate: "-2: 28.1%",
      trapNotes: "Missing pi phase change upon reflection from denser boundary.",
      link: "/materials",
    },
    {
      name: "Thermodynamics & Kinetic Theory",
      sub: "Physics // Heat Engines & Polytropic Paths",
      weightage: "8.6%",
      negativeRate: "-2: 22.4%",
      trapNotes: "Work done convention sign confusion between chemistry and physics standards.",
      link: "/materials",
    },
  ],
  Chemistry: [
    {
      name: "Organic Reaction Mechanisms & GOC",
      sub: "Chemistry // Stereochemistry & Carbocation Shifts",
      weightage: "14.2%",
      negativeRate: "-2: 44.8%",
      trapNotes: "Hydride vs methyl shift stereochemical inversions in pinacol rearrangements.",
      link: "/materials",
    },
    {
      name: "Coordination Compounds & CFT",
      sub: "Chemistry // Inorganic Ligand Field Theory",
      weightage: "11.1%",
      negativeRate: "-2: 36.3%",
      trapNotes: "Jahn-Teller distortion geometry traps in high-spin d4 and low-spin d7 complexes.",
      link: "/materials",
    },
    {
      name: "Chemical & Ionic Equilibrium",
      sub: "Chemistry // Solubility Products & Buffer pH",
      weightage: "9.5%",
      negativeRate: "-2: 31.9%",
      trapNotes: "Ignoring water auto-ionization in ultra-dilute strong acid calculations.",
      link: "/materials",
    },
  ],
  Mathematics: [
    {
      name: "Definite Integrals & Riemann Summations",
      sub: "Mathematics // Integral Calculus & Leibniz Rule",
      weightage: "15.0%",
      negativeRate: "-2: 38.5%",
      trapNotes: "Differentiating integral limits without accounting for integrand discontinuities.",
      link: "/materials",
    },
    {
      name: "Probability & Bayes Matrix Formulation",
      sub: "Mathematics // Combinatorics & Markov Events",
      weightage: "11.4%",
      negativeRate: "-2: 42.1%",
      trapNotes: "Confounding conditional probability P(A|B) with joint distribution P(A and B).",
      link: "/materials",
    },
    {
      name: "Coordinate Geometry & Conic Sections",
      sub: "Mathematics // Parabola & Hyperbola Loci",
      weightage: "13.2%",
      negativeRate: "-2: 35.8%",
      trapNotes: "Assuming director circle tangents are real when point lies within auxiliary ellipse.",
      link: "/materials",
    },
  ],
};

const peerRoster = [
  { id: "#1092 [IITB EE]", time: "2h 14m", target: "JEE ADV" },
  { id: "#0421 [AIIMS D]", time: "1h 48m", target: "NEET '26" },
  { id: "#8819 [IITD CS]", time: "3h 22m", target: "JEE ADV" },
];

export default function Index() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || "Aspirant";

  // ───── Signature Live Study Desk Carrel State ─────
  const [timerSeconds, setTimerSeconds] = useState(9971); // 02:46:11 default
  const [isCarrelActive, setIsCarrelActive] = useState(false);
  const [activeLedgerTab, setActiveLedgerTab] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isCarrelActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCarrelActive]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleCarrelAction = () => {
    if (!isCarrelActive) {
      setIsCarrelActive(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
      toast.success("Joined Live Silent Carrel (Desk #85)", {
        description: "Focus telemetry synchronized with IITB study cohort.",
      });
    } else {
      navigate("/ypt");
    }
  };

  return (
    <Layout>
      <div className="w-full text-foreground overflow-x-hidden selection:bg-amber-500/20 selection:text-foreground">
        
        {/* Subtle Archival Subheader Strip */}
        <div className="w-full border-b border-border/80 bg-muted/40 py-1.5 px-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center text-xs font-mono tracking-wider text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>BOOKIE ACADEMIC INK // JEE ADVANCED &amp; NEET ARCHIVAL REPOSITORY</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px]">
              <span>TCS iON MIRROR V4.81</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">12MS LATENCY</span>
            </div>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-16">
          
          {/* ───── 1. HERO SECTION: Split Screen Academic Desk ───── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2" id="home">
            
            {/* Left Column: Clear Typographic Hierarchy & Primary Action */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Eyebrow Slug */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card font-mono text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>§ ACADEMIC REGISTER // ARCHIVE REF: 2026-04 • JEE ADV</span>
              </div>

              {/* Display H1 Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight leading-[1.08] text-foreground">
                Survive the <em className="italic text-primary font-normal">syllabus.</em><br />
                Rule the ranks<span className="text-primary font-bold">.</span>
              </h1>

              {/* Subhead Lead */}
              <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Engineered exclusively for JEE Advanced and NEET aspirants who refuse to let 10-hour grinds derail into passive distraction. Verbatim TCS iON test engines, deconstructed Kota archival notes, direct peer proctor carrels, and zero vanity gamification.
              </p>

              {/* 3 Academic Metrics Pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl border border-border bg-card shadow-xs">
                  <div className="font-mono text-base sm:text-lg font-bold text-foreground">3,420+</div>
                  <div className="text-[11px] text-muted-foreground font-sans mt-0.5 leading-snug">Deconstructed PYQs</div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card shadow-xs">
                  <div className="font-mono text-base sm:text-lg font-bold text-foreground">100%</div>
                  <div className="text-[11px] text-muted-foreground font-sans mt-0.5 leading-snug">Verbatim CBT Format</div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card shadow-xs">
                  <div className="font-mono text-base sm:text-lg font-bold text-foreground">0%</div>
                  <div className="text-[11px] text-muted-foreground font-sans mt-0.5 leading-snug">Vanity Clutter</div>
                </div>
              </div>

              {/* Single Primary Action + Secondary Outline */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/ypt"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-sans font-medium text-sm shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  <span>Enter Proctored Chamber</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/materials"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-sans font-medium text-sm shadow-xs transition-all active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>Inspect 10-Yr Syllabus Ledger</span>
                </Link>
              </div>

              {/* Micro Trust Note */}
              <p className="text-[11px] font-mono text-muted-foreground/80 pt-1">
                Strict Proctor Protocol: Zero telemetry sold. Free academic utility for dedicated candidates.
              </p>
            </div>

            {/* Right Column: Live Proctored Focus Carrel (Elevated Card) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
                
                {/* Carrel Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                      CARREL ACTIVE #84
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground uppercase">
                    LATENCY: 14MS
                  </span>
                </div>

                {/* Active Subject Dossier */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                    ADVANCED PHYSICS // ROTATIONAL MECH
                  </div>
                  <h3 className="font-serif text-lg font-medium text-foreground leading-snug">
                    Rigid Body Dynamics: Variable Mass Systems &amp; Non-Inertial Torque
                  </h3>
                  <div className="text-xs text-muted-foreground font-sans">
                    Paper-II Standard Reference Problems • HC Verma Vol 1 Ch 10
                  </div>
                </div>

                {/* Signature Tabular Live Countdown */}
                <div className="p-4 rounded-xl border border-border bg-muted/40 text-center space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    CURRENT IMMERSION SPRINT
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {formatTimer(timerSeconds)}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    ACCURACY: 98.4% • PACE: 2.4 MIN/Q
                  </div>
                </div>

                {/* Live Peer Carrel Roster */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    CONCURRENT CARREL CANDIDATES
                  </div>
                  <div className="space-y-1.5">
                    {peerRoster.map((peer, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/80 bg-card text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-foreground">{peer.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{peer.time}</span>
                          <span>•</span>
                          <span className="text-primary font-semibold">{peer.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={handleCarrelAction}
                  className="w-full py-3 px-4 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-sans font-medium text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isCarrelActive ? "Open Cockpit Station →" : "Join Live Silent Carrel (Desk #85)"}
                </button>

                <div className="text-center text-[10px] font-mono text-muted-foreground">
                  PEER VIDEO PROTOCOL // SILENT CO-STUDY // ZERO AUDIO
                </div>
              </div>
            </div>
          </section>

          {/* ───── 2. METRIC BANNER (4 Columns) ───── */}
          <section className="border-y border-border py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl font-normal text-primary">1:1</div>
                <div className="text-xs font-sans text-muted-foreground">CBT Exam Mirror Accuracy</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl font-normal text-primary">99.4%</div>
                <div className="text-xs font-sans text-muted-foreground">Top-1000 Conversion Cohort</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl font-normal text-primary">0%</div>
                <div className="text-xs font-sans text-muted-foreground">Vanity Points &amp; Streaks</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl font-normal text-primary">14,200+</div>
                <div className="text-xs font-sans text-muted-foreground">Hours Logged in Strict Silence</div>
              </div>
            </div>
          </section>

          {/* ───── 3. ARCHITECTURE OF MASTERY: The 3 Pillars ───── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  ARCHITECTURE OF MASTERY
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground tracking-tight mt-1">
                  The Three Pillars of Sovereign Preparation
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-muted-foreground max-w-md">
                Disciplined academic tools to anchor your focus, build deep algorithmic intuition, and eliminate exam day cognitive shock.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1 */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary font-semibold">PILLAR // 01</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    Silent Proctored Study Chambers
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    Zero chat channels, no memes, no distraction traps. Synchronized pomodoros and optional peer webcams simulate authentic examination hall pressure.
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-sans pt-1">
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Continuous acoustic focus masking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Automatic active session ledger logging</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Peer study room capacity limits</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/ypt"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary hover:underline pt-2"
                >
                  <span>Audit Study Carrel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary font-semibold">PILLAR // 02</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    10-Year Deconstructed PYQ Matrix
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    Every single problem from 2014 to 2024 deconstructed by error-frequency, first-principle proofs, and faculty marginalia.
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-sans pt-1">
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Step-by-step calculus vs symmetry proofs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Multiple solutions per JEE Adv problem</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Direct vector OCR &amp; KaTeX rendering</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/materials"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary hover:underline pt-2"
                >
                  <span>Open Archival Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary font-semibold">PILLAR // 03</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    Verbatim TCS iON Exam Engine
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    Practice under the exact visual and physical interface you will face on test day. Color palette, question palette keys, and negative mark audits.
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-sans pt-1">
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Instant negative marking audit upon submit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Exact NTA screen layout &amp; font rendering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>Percentile prediction from verified cohort</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/tests"
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary hover:underline pt-2"
                >
                  <span>Launch Test Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* ───── 4. HIGH-YIELD CHAPTER LEDGER & TRAP FREQUENCY ───── */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                  SYLLABUS DECONSTRUCTION LEDGER
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground tracking-tight mt-1">
                  High-Yield Chapter Ledger &amp; Trap Frequency
                </h2>
              </div>

              {/* Subject Filter Tabs */}
              <div className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1 font-sans text-xs">
                {(["Physics", "Chemistry", "Mathematics"] as const).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveLedgerTab(sub)}
                    className={cn(
                      "px-3.5 py-1 rounded-full transition-all cursor-pointer font-medium",
                      activeLedgerTab === sub
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4 sm:px-6">Chapter Index &amp; Module</th>
                      <th className="py-3 px-3 text-center">Exam Weight</th>
                      <th className="py-3 px-3 text-center">Trap Rate</th>
                      <th className="py-3 px-4 hidden md:table-cell">Primary Trap Architecture</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {chaptersBySubject[activeLedgerTab].map((ch, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-medium text-foreground text-sm">{ch.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{ch.sub}</div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-foreground">
                          {ch.weightage}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                            {ch.negativeRate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground hidden md:table-cell leading-relaxed">
                          {ch.trapNotes}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={ch.link}
                            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            <span>Deconstruct</span>
                            <span>↗</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ───── 5. JEE COUNTDOWN INTEGRATION ───── */}
          <section className="space-y-4">
            <JEECountdown />
          </section>

          {/* ───── 6. THE BOOKIE COVENANT ───── */}
          <section className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-12 text-center space-y-6">
            <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              THE BOOKIE COVENANT
            </div>
            
            <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-foreground font-normal max-w-3xl mx-auto leading-relaxed">
              &ldquo;Exams of this magnitude are never won through cheap dopamine or colorful badge streaks. They are won through quiet, relentless conviction and thousands of solitary hours spent wrestling with the unsolved page.&rdquo;
            </blockquote>

            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              The Board of Academic Review // BOOKIE SCHOLARS COMMITTEE • EST. 2024
            </div>

            <div className="pt-2">
              <Link
                to="/ypt"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-sans font-medium text-sm shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Claim Candidate Register &amp; Begin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </main>
      </div>
    </Layout>
  );
}
