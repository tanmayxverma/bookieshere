import { Link } from "react-router-dom";
import { Copy, MessageSquareText, ArrowUpRight, ArrowRight, BookOpen, FileText, HeadphonesIcon, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { JEECountdown } from "@/components/JEECountdown";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const Index = () => {
  const scrollRef = useScrollReveal();
  const { profile } = useProfile();
  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || "";

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("9906DZRL");
    toast.success("Code copied: 9906DZRL");
  };

  return (
    <Layout>
      <div ref={scrollRef} className="w-full bg-background blueprint-grid text-on-surface overflow-x-hidden selection:bg-brand-yellow selection:text-brand-dark dark:selection:bg-brand-blue dark:selection:text-white min-h-screen relative">
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16">
          
          {/* ───── HERO ───── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4" id="home">
            {/* Left Column: Hero Banter & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Welcome Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-brand-blue dark:text-blue-400 text-xs font-mono font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                <span className="font-bold tracking-wide">{firstName ? `WELCOME BACK, ${firstName.toUpperCase()} • ` : ""}JEE 2027 TARGET SYSTEM</span>
              </div>
              
              {/* Big Headline */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-ruling font-extrabold tracking-tight leading-[1.05] text-slate-950 dark:text-white uppercase">
                  SURVIVE THE <br/>
                  <span className="text-brand-blue italic relative inline-block">
                    SYLLABUS.
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-amber-400 rounded-full opacity-80" />
                  </span><br/>
                  RULE THE RANKS.
                </h1>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                Your single unified workspace for <strong className="text-slate-900 dark:text-white font-semibold">JEE materials</strong>, savagely honest mocks, and test strategies — engineered with mathematical clarity, zero fluff, and anti-burnout humor.
              </p>

              {/* CTA Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/materials"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-600 transition shadow-sm hover:-translate-y-0.5 active:translate-y-0 text-center"
                >
                  <BookOpen className="w-4 h-4" />
                  BROWSE MATERIALS →
                </Link>
                <Link
                  to="/tests"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-bold text-sm border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm hover:-translate-y-0.5 text-center"
                >
                  <FileText className="w-4 h-4" />
                  PRACTICE TESTS
                </Link>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 font-mono font-bold text-xs sm:text-sm pl-2 py-2"
                >
                  <span>🎧</span> CHAT SUPPORT
                </Link>
              </div>
            </div>

            {/* Right Column: Unified Promo Card */}
            <div className="lg:col-span-5" data-purpose="promo-card">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-sm relative overflow-hidden transition hover:-translate-y-0.5 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono tracking-wider font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/70 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 uppercase">
                    PROMO ACTIVE
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-brand-blue text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                    LIMITED
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-3xl font-display font-black text-slate-950 dark:text-white tracking-tight">10% OFF</h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">community privilege</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">On any PW batch with the community code below.</p>
                
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mb-4 group hover:border-brand-blue transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-widest">COUPON CODE</span>
                    <span className="font-mono font-extrabold text-brand-blue tracking-wider text-base select-all">9906DZRL</span>
                  </div>
                  <button onClick={handleCopyCoupon} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs" title="Copy coupon code">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <a href="https://physicswallah.onelink.me/ZAZB/km5qwl9y" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-mono font-extrabold text-brand-blue hover:underline tracking-wider mb-4">
                  GET DISCOUNT <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                {/* Value Chips Strip */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">FREE</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">Full Access</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">NO</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">Credit Card</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">DAILY</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">PYQ Drop</div>
                  </div>
                </div>

                {/* Subtle Sponsor Placement */}
                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 font-normal mt-3">
                  You can advertise yourself here, contact owner through{" "}
                  <Link to="/support" className="text-brand-blue font-semibold underline hover:text-slate-900 dark:hover:text-white transition-colors">
                    support
                  </Link>.
                </p>
              </div>
            </div>
          </section>

          {/* ───── JEE COUNTDOWN ───── */}
          <JEECountdown />

          {/* ───── THE 3 PILLARS ───── */}
          <section className="space-y-6" id="materials">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="font-mono text-xs font-extrabold text-brand-blue tracking-wider uppercase">CURATED FOR CLARITY</div>
                <h2 className="text-3xl sm:text-4xl font-display font-black text-brand-dark dark:text-white tracking-tight mt-1">
                  The 3 Pillars of Prep.
                </h2>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">(and how we survive them without emotional breakdown)</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
                Updated with 2024-2015 PYQs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Physics */}
              <article className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-6 shadow-brutal dark:shadow-none flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-extrabold text-brand-blue tracking-wider">01 / PHYSICS CORE</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-brand-blue dark:text-blue-400">94% High-Yield</span>
                  </div>
                  <h3 className="text-2xl font-display font-black leading-snug text-brand-dark dark:text-white group-hover:text-brand-blue transition-colors">
                    When you finally hit that flow state...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 leading-relaxed">
                    Master Irodov traps, rotational motion inertia shortcuts, and ray diagrams that actually make sense. No 4-page derivations when a 2-line impulse-momentum trick works.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">HC Verma + DC Pandey drills</span>
                  <Link to="/materials" className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-mono hover:bg-brand-blue transition-colors">→</Link>
                </div>
              </article>

              {/* Chemistry */}
              <article className="bg-amber-100/70 dark:bg-amber-950/40 border-2 border-slate-900 dark:border-amber-700/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:-translate-y-1 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-extrabold text-amber-950 dark:text-amber-200 tracking-wider">02 / THE 3 AM DELUSION</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 border border-amber-900/10">Organic Chemistry</span>
                  </div>
                  <h3 className="text-2xl font-display font-black leading-snug text-amber-950 dark:text-amber-200">
                    The 3 AM motivation spike.
                  </h3>
                  <div className="bg-white/85 dark:bg-slate-900/80 rounded-xl p-3.5 mt-3 border border-amber-900/15 dark:border-amber-600/30 text-xs font-serif italic text-amber-950 dark:text-amber-200 leading-relaxed shadow-xs">
                    "Organic Chem at 3 AM makes total sense until you wake up next morning and can't name a single ketone."
                  </div>
                  <p className="text-amber-950 dark:text-amber-200/90 text-sm mt-3 font-medium leading-relaxed">
                    Reaction mechanism flowcharts, GOC acidity orders, and MS Chouhan question banks indexed with hints.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-amber-300 dark:border-amber-700/60 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-300">Named Reactions Cheat Sheet</span>
                  <Link to="/materials" className="w-8 h-8 rounded-full bg-amber-950 dark:bg-amber-900 text-white flex items-center justify-center font-mono hover:bg-white hover:text-amber-950 transition-colors">→</Link>
                </div>
              </article>

              {/* Mathematics */}
              <article className="bg-slate-900 dark:bg-slate-950 text-white border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:-translate-y-1 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-extrabold text-blue-400 tracking-wider">03 / REALITY CHECK</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-blue-300">Calculus & Vectors</span>
                  </div>
                  <h3 className="text-2xl font-display font-black leading-snug text-white group-hover:text-blue-400 transition-colors">
                    Facing the calculus reality.
                  </h3>
                  <div className="bg-slate-800 rounded-xl p-3.5 mt-3 border border-slate-700 text-xs font-mono text-slate-300 font-medium leading-relaxed">
                    My pending revision pile staring at me while I calculate the absolute minimum marks needed to clear the cutoff.
                  </div>
                  <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                    Definite Integrals King's property templates, 3D Geometry vector lines, and probability speed cards.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">Black Book Solution Bank</span>
                  <Link to="/materials" className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-mono hover:bg-white hover:text-slate-900 transition-colors">→</Link>
                </div>
              </article>
            </div>
          </section>

          {/* ───── COMMUNITY BANTER ───── */}
          <section className="space-y-6" id="banter">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="font-mono text-xs font-extrabold text-brand-blue uppercase tracking-wider">COMMUNITY DOSSIER</div>
                <h2 className="text-3xl font-display font-black text-brand-dark dark:text-white tracking-tight mt-0.5">
                  Batch Buzz & Relatable Trauma
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Live Aspirant Feed
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Post 1 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center">TT</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">@topper_translator</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">TOPPER LOGIC • 2m ago</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">▲ 7.4K</span>
                </div>
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl p-3.5 text-xs text-slate-800 dark:text-amber-100 font-serif italic leading-relaxed">
                  “Kuch nahi padha” ka matlab: Sirf NCERT, 15 saal ke PYQs, coaching modules aur 14 mock tests.
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">Topper: “Bhai kuch nahi padha.”</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Also topper: 99.8 percentile in first attempt with neat color-coded notes.</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MessageSquareText className="w-3.5 h-3.5"/> 603 comments</span>
                  <button className="hover:text-brand-blue font-bold">Share with batch ↗</button>
                </div>
              </div>

              {/* Post 2 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-mono font-bold text-xs flex items-center justify-center">PR</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">@paper_review_expert</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">DAMAGE CONTROL • 18m ago</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">▲ 5.9K</span>
                </div>
                <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 rounded-xl p-3.5 text-xs text-slate-800 dark:text-rose-100 font-serif italic leading-relaxed">
                  Marks discuss nahi karenge. User experience solid tha. Invigilator bhi chill the.
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">Mummy: “Beta paper kaisa gaya?”</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Me: Paper ka font bohot readable tha aur exam hall mein AC sahi temperature pe chal raha tha.</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MessageSquareText className="w-3.5 h-3.5"/> 447 comments</span>
                  <button className="hover:text-brand-blue font-bold">Share with batch ↗</button>
                </div>
              </div>

              {/* Post 3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center">PA</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">@pyq_archaeologist</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">JEE + CET • 1h ago</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">▲ 4.6K</span>
                </div>
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl p-3.5 text-xs text-slate-800 dark:text-emerald-100 font-serif italic leading-relaxed">
                  Chapter: “Main toh bilkul easy hoon.” <br/>First PYQ: “Toh ab prove karke dikhao.”
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">Easy chapter bolke start kiya tha...</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Do questions baad confidence, calculator aur Sunday — teeno missing report mein hain.</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MessageSquareText className="w-3.5 h-3.5"/> 318 comments</span>
                  <button className="hover:text-brand-blue font-bold">Share with batch ↗</button>
                </div>
              </div>
            </div>
          </section>

          {/* ───── PUNCHLINE CTA ───── */}
          <section className="bg-brand-softYellow dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-brutal dark:shadow-none">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-amber-300 dark:bg-amber-900/60 rounded-md text-[11px] font-mono font-black text-amber-950 dark:text-amber-200 tracking-wider uppercase">
                  PLOT TWIST
                </div>
                <h3 className="text-2xl sm:text-4xl font-display font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                  Itna scroll kar hi liya? Ab ek test bhi de hi do.
                </h3>
                <p className="text-amber-950 dark:text-slate-300 font-medium text-sm sm:text-base">
                  Memes marks nahi badhaate. Honest timed mocks kabhi-kabhi badha dete hain.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link to="/tests" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-950 dark:bg-brand-blue text-white font-display font-black text-base tracking-wide hover:bg-brand-blue dark:hover:bg-blue-600 transition-all shadow-md hover:scale-105 active:scale-95">
                  OPEN BOOKIE MOCK →
                </Link>
              </div>
            </div>
          </section>

        </main>
      </div>
    </Layout>
  );
};

export default Index;
