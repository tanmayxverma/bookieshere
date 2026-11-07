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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-blue dark:text-blue-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>
                {firstName ? `WELCOME BACK, ${firstName.toUpperCase()} • ` : ""}JEE 2027 TARGET
              </div>
              
              {/* Big Headline */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight leading-[1.05] text-brand-dark dark:text-white uppercase">
                  SURVIVE THE <br/>
                  <span className="text-brand-blue">SYLLABUS.</span><br/>
                  RULE THE RANKS.
                </h1>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-xl font-medium leading-relaxed max-w-xl">
                Your single platform for <strong className="text-slate-900 dark:text-white font-bold">JEE materials</strong>, honest mock tests and clear test strategies — engineered with clarity and zero fluff.
              </p>

              {/* CTA Buttons Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  to="/materials"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-full bg-brand-blue text-white font-bold text-sm sm:text-base hover:bg-blue-600 transition-all shadow-brutal-blue hover:-translate-y-0.5 active:translate-y-0 text-center"
                >
                  <BookOpen className="w-5 h-5" />
                  BROWSE MATERIALS →
                </Link>
                <Link
                  to="/tests"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full bg-white dark:bg-slate-900 text-brand-dark dark:text-white font-bold text-sm sm:text-base border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-brutal dark:shadow-none hover:-translate-y-0.5 text-center"
                >
                  <FileText className="w-5 h-5" />
                  PRACTICE TESTS
                </Link>
                <Link
                  to="/support"
                  className="inline-flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 font-mono font-bold text-xs sm:text-sm underline underline-offset-4 decoration-2 decoration-blue-200 dark:decoration-blue-800 hover:decoration-brand-blue transition-colors px-3 sm:px-2 py-3 sm:py-2 text-center"
                >
                  <span>🎧</span> CHAT SUPPORT
                </Link>
              </div>

            </div>

            {/* Right Column: Promo Card + Live Stats Dashboard */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-6 shadow-brutal dark:shadow-none relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-brand-blue text-white text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-md tracking-wider">
                    LIMITED
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">PROMO ACTIVE</span>
                  <div className="text-3xl font-black font-display text-brand-dark dark:text-white">10% OFF</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">On any PW batch with the community code below.</p>
                </div>
                
                <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 hover:border-brand-blue transition-colors">
                  <span className="font-mono font-extrabold text-brand-blue tracking-wider text-base select-all">9906DZRL</span>
                  <button onClick={handleCopyCoupon} className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors p-1" title="Copy coupon code">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                
                <a href="https://physicswallah.onelink.me/ZAZB/km5qwl9y" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-mono font-extrabold text-brand-blue hover:underline tracking-wider">
                  GET DISCOUNT <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Advertise Callout */}
              <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center shadow-xs">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  You can advertise yourself here, contact owner through{" "}
                  <Link to="/support" className="text-brand-blue font-bold underline hover:text-brand-dark dark:hover:text-white transition-colors">
                    support
                  </Link>{" "}
                  for it.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm text-left">
                  <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">FREE</div>
                  <div className="text-sm font-black text-brand-dark dark:text-white mt-0.5">Full Access</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm text-left">
                  <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">NO</div>
                  <div className="text-sm font-black text-brand-dark dark:text-white mt-0.5">Credit Card</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm text-left">
                  <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">DAILY</div>
                  <div className="text-sm font-black text-brand-dark dark:text-white mt-0.5">PYQ Drop</div>
                </div>
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
              <article className="bg-brand-yellow dark:bg-amber-950/40 border-2 border-slate-900 dark:border-amber-700/60 rounded-2xl p-6 shadow-brutal dark:shadow-none flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-extrabold text-amber-950 dark:text-amber-200 tracking-wider">02 / CHEMISTRY CORE</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300">Organic Chemistry</span>
                  </div>
                  <h3 className="text-2xl font-display font-black leading-snug text-amber-950 dark:text-amber-200">
                    The 3 AM motivation spike.
                  </h3>
                  <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-3.5 mt-3 border border-amber-900/20 dark:border-amber-600/30 text-xs font-mono text-amber-900 dark:text-amber-200 font-semibold italic shadow-sm">
                    "Organic Chem at 3 AM makes total sense until you wake up next morning and can't name a single ketone."
                  </div>
                  <p className="text-amber-950 dark:text-amber-200/90 text-sm mt-3 font-medium leading-relaxed">
                    Reaction mechanism flowcharts, GOC acidity orders, and MS Chouhan question banks indexed with hints.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-amber-400 dark:border-amber-700/60 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-300">Named Reactions Cheat Sheet</span>
                  <Link to="/materials" className="w-8 h-8 rounded-full bg-amber-950 dark:bg-amber-900 text-white flex items-center justify-center font-mono hover:bg-white hover:text-amber-950 transition-colors">→</Link>
                </div>
              </article>

              {/* Mathematics */}
              <article className="bg-slate-900 dark:bg-slate-950 text-white border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-6 shadow-brutal dark:shadow-none flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-extrabold text-blue-400 tracking-wider">03 / MATHS CORE</span>
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



        </main>
      </div>
    </Layout>
  );
};

export default Index;
