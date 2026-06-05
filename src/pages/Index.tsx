import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Target, Shield, CheckCircle, FileText, HeadphonesIcon, Atom, FlaskConical, Sigma, Copy, ExternalLink, BookOpen } from "lucide-react";
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
    toast.success("Coupon code copied!");
  };

  return (
    <Layout>
      <div ref={scrollRef} className="overflow-x-hidden selection:bg-primary/30">
        {/* ───── HERO ───── */}
        <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Asymmetric ambient glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-12 items-end relative z-10">
            <div className="lg:col-span-8 space-y-8 opacity-0 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-semibold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                {firstName ? `Welcome back, ${firstName}` : "Built for serious aspirants"}
              </div>

              <h1 className="font-display text-6xl sm:text-7xl lg:text-9xl font-black text-foreground leading-[0.9] tracking-tighter">
                BOOKIE<span className="text-primary text-2xl sm:text-3xl align-top ml-1">®</span>
              </h1>

              <p className="max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                Your single platform for <span className="text-foreground font-medium">JEE materials</span>, tests, and guidance — engineered with clarity and focus for every aspirant.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/materials"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide rounded-md transition-all shadow-[0_0_24px_hsl(var(--primary)/0.3)] active:scale-[0.98]"
                >
                  <BookOpen className="h-4 w-4" />
                  BROWSE MATERIALS
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/tests"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-border hover:border-primary/50 hover:bg-surface-1 text-foreground font-bold tracking-wide rounded-md transition-all"
                >
                  <FileText className="h-4 w-4" />
                  PRACTICE TESTS
                </Link>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-muted-foreground hover:text-foreground font-bold tracking-wide transition-all underline underline-offset-8 decoration-primary/30 hover:decoration-primary"
                >
                  <HeadphonesIcon className="h-4 w-4" />
                  CHAT SUPPORT
                </Link>
              </div>
            </div>

            {/* Side column: promo + trust */}
            <div className="lg:col-span-4 space-y-5 opacity-0 animate-fade-in stagger-2">
              <div className="relative p-6 rounded-2xl bg-surface-1/60 backdrop-blur-xl border border-border/60 overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-black tracking-widest">
                  LIMITED
                </div>
                <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-widest">Promo Active</p>
                <h3 className="text-3xl font-display font-bold text-foreground mb-1">10% OFF</h3>
                <p className="text-sm text-muted-foreground mb-4">On any PW batch with code below.</p>

                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={handleCopyCoupon}
                    className="flex-1 inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-background/60 border border-border/60 text-sm font-mono font-bold text-primary hover:border-primary/50 transition-colors"
                  >
                    9906DZRL
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>

                <a
                  href="https://physicswallah.onelink.me/ZAZB/km5qwl9y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  Get Discount <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: "Free", v: "Access" },
                  { k: "No", v: "Signup" },
                  { k: "Daily", v: "Updates" },
                ].map((s) => (
                  <div key={s.v} className="px-3 py-3 rounded-lg bg-surface-1/40 border border-border/40">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{s.k}</p>
                    <p className="text-sm text-foreground font-semibold">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───── JEE ADVANCED 2027 COUNTDOWN ───── */}
        <JEECountdown />

        {/* ───── EXPLORE SUBJECTS ───── */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-14 scroll-reveal">
            <div className="space-y-3">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Explore Subjects</h2>
              <div className="h-1 w-12 bg-primary rounded-full" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Curated study materials across the three pillars of JEE — chosen for clarity, depth, and trust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { subject: "physics", icon: Atom, label: "Physics", desc: "Mechanics, electromagnetism, thermodynamics & optics — taught with conceptual rigor.", books: "HC Verma · Irodov · DC Pandey", accent: "physics" },
              { subject: "chemistry", icon: FlaskConical, label: "Chemistry", desc: "Organic, inorganic & physical chemistry — structured for clean retention.", books: "MS Chouhan · VK Jaiswal · N Avasthi", accent: "chemistry" },
              { subject: "mathematics", icon: Sigma, label: "Mathematics", desc: "Calculus, algebra & coordinate geometry — sharpened with high-yield problem sets.", books: "Cengage · Black Book · Amit Agarwal", accent: "mathematics" },
            ].map((item, i) => {
              const Icon = item.icon;
              const accentText = { physics: "text-physics", chemistry: "text-chemistry", mathematics: "text-mathematics" }[item.accent];
              const accentBg = { physics: "bg-physics/10", chemistry: "bg-chemistry/10", mathematics: "bg-mathematics/10" }[item.accent];
              const accentBorder = { physics: "hover:border-physics/50", chemistry: "hover:border-chemistry/50", mathematics: "hover:border-mathematics/50" }[item.accent];
              return (
                <Link
                  key={item.subject}
                  to={`/materials?subject=${item.subject}`}
                  className={`group relative p-8 rounded-3xl bg-surface-1/60 backdrop-blur-xl border border-border/60 ${accentBorder} transition-all duration-500 hover:-translate-y-1 scroll-reveal scroll-reveal-delay-${i + 1}`}
                >
                  <div className={`w-12 h-12 mb-6 rounded-xl ${accentBg} flex items-center justify-center ${accentText} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">{item.label}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{item.desc}</p>
                  <div className="pt-4 border-t border-border/40 mb-4">
                    <p className="text-[11px] text-muted-foreground/70 font-medium tracking-wide">{item.books}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase ${accentText}`}>
                    View Resources <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ───── WHY BOOKIE ───── */}
        <section className="max-w-7xl mx-auto px-6 py-24 mb-12 bg-primary/5 rounded-[3rem] border border-primary/10 scroll-reveal">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
              <Shield className="h-3 w-3" /> Our Promise
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Why BOOKIE?</h2>
            <p className="text-muted-foreground">Built with intention, not just features — for aspirants who value quality over quantity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { n: "01", icon: Target, title: "Curated Resources", desc: "Carefully selected materials from trusted sources — vetted for relevance to JEE Main & Advanced." },
              { n: "02", icon: Sparkles, title: "Clean Interface", desc: "No clutter. No noise. Find what you need, fast — and get back to studying." },
              { n: "03", icon: Shield, title: "Always Updated", desc: "Daily refreshes with new materials, tests, and resources from the BOOKIE library." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`relative text-center md:text-left space-y-4 p-6 ${i === 1 ? "md:border-x md:border-border/40" : ""} scroll-reveal scroll-reveal-delay-${i + 1}`}
                >
                  <p className="font-mono text-primary text-sm tracking-widest">{item.n}</p>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto md:mx-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-xl font-display font-bold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───── CLOSING VALUES STRIP ───── */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="border-t border-border/40 pt-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-display font-black italic text-2xl text-foreground">BOOKIE</span>
              <span className="hidden sm:block h-5 w-px bg-border" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Academic Excellence</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {["Clarity", "Focus", "Consistency"].map((w, i) => (
                <div key={w} className="flex items-center gap-2">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-primary" />}
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-primary" /> {w}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
