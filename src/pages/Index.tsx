import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Sparkles, Target, Shield, CheckCircle, FileText, HeadphonesIcon, Unlock, UserX, RefreshCw, Flame, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { toast } from "sonner";

const Index = () => {
  const scrollRef = useScrollReveal();

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("9906DZRL");
    toast.success("Coupon code copied!");
  };

  return (
    <Layout>
      <div ref={scrollRef}>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-6 pb-10 md:pt-8 md:pb-14">
          <div className="hero-glow" />
          <div className="hero-glow-secondary" />
          
          <div className="w-full max-w-6xl mx-auto px-6 text-center relative z-10">
            <div className="space-y-8 md:space-y-10">
              {/* Trust pill */}
              <div className="opacity-0 animate-fade-in">
                <span className="inline-flex items-center gap-2.5 px-7 py-2.5 rounded-full border border-border/40 bg-surface-1/60 text-[15px] font-medium text-muted-foreground/90 tracking-wide backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-primary/70" />
                  Built for serious aspirants
                </span>
              </div>

              {/* Brand heading */}
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black tracking-tight opacity-0 animate-fade-in stagger-1 leading-none">
                <span className="text-gradient-glow">BOOKIE</span>
              </h1>
              
              {/* Subtitle */}
              <div className="space-y-3 opacity-0 animate-fade-in stagger-2">
                <p className="text-2xl md:text-3xl text-foreground max-w-3xl mx-auto leading-relaxed font-semibold">
                  Your single platform for{" "}
                  <span className="text-emphasis">JEE materials</span>, tests, and guidance.
                </p>
                <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                  Clarity and focus for every aspirant.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center opacity-0 animate-fade-in stagger-3 flex-wrap">
                <Button asChild className="gap-2.5 bg-primary text-primary-foreground hover:bg-primary/85 shadow-lg shadow-primary/25 btn-press btn-lift px-10 h-[52px] text-[15px] font-medium rounded-xl">
                  <Link to="/materials">
                    <BookOpen className="h-5 w-5" />
                    Browse Materials
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild className="gap-2.5 bg-primary text-primary-foreground hover:bg-primary/85 shadow-lg shadow-primary/25 btn-press btn-lift px-10 h-[52px] text-[15px] font-medium rounded-xl">
                  <Link to="/tests">
                    <FileText className="h-5 w-5" />
                    Practice Tests
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild className="gap-2.5 bg-primary text-primary-foreground hover:bg-primary/85 shadow-lg shadow-primary/25 btn-press btn-lift px-10 h-[52px] text-[15px] font-medium rounded-xl">
                  <Link to="/support">
                    <HeadphonesIcon className="h-5 w-5" />
                    Chat Support
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Trust benefit blocks */}
              <div className="opacity-0 animate-fade-in stagger-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                  {[
                    { icon: Unlock, label: "Free access" },
                    { icon: UserX, label: "No signup required" },
                    { icon: RefreshCw, label: "Daily updates" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-1/50 border border-border/20">
                      <item.icon className="h-5 w-5 text-primary/60 shrink-0" />
                      <span className="text-[15px] text-muted-foreground/70 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="pb-10 md:pb-14 relative">
          <div className="max-w-2xl mx-auto px-6">
            <div className="relative rounded-xl border border-border/30 bg-surface-1/60 backdrop-blur-sm p-5 sm:p-6 shadow-sm scroll-reveal">
              {/* LIMITED badge */}
              <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/15 text-primary border border-primary/20">
                Limited
              </span>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                  <Flame className="h-4 w-4 text-primary/70 shrink-0" />
                  <span className="font-medium">Limited Physics Offer</span>
                </div>
                
                <div className="hidden sm:block w-px h-5 bg-border/30" />
                
                <p className="text-[13px] sm:text-sm text-foreground/90 font-medium text-center sm:text-left">
                  Get <span className="text-primary">10% OFF</span> on any PW batch
                </p>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleCopyCoupon}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/30 text-xs font-mono font-semibold text-foreground/90 hover:bg-muted transition-colors cursor-pointer"
                  >
                    9906DZRL
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                  
                  <a
                    href="https://physicswallah.onelink.me/ZAZB/km5qwl9y"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Get Discount
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Subjects Section */}
        <section className="py-20 bg-surface-1 border-y border-border/30 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center mb-12 scroll-reveal">
              <span className="pill mb-4 shadow-sm">
                <Target className="h-3 w-3" />
                Core Subjects
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Explore <span className="text-gradient-glow">Subjects</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto flex items-center justify-center gap-2">
                <span className="w-6 h-px bg-border/50" />
                Select a subject to browse curated study materials
                <span className="w-6 h-px bg-border/50" />
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { subject: "physics", color: "physics", books: "HC Verma, Irodov, DC Pandey", desc: "Mechanics, thermodynamics, electromagnetism, optics, and more." },
                { subject: "chemistry", color: "chemistry", books: "MS Chouhan, VK Jaiswal, N Avasthi", desc: "Organic, inorganic, and physical chemistry resources." },
                { subject: "mathematics", color: "mathematics", books: "Cengage, Black Book, Amit Agarwal", desc: "Calculus, algebra, coordinate geometry, and problem sets." },
              ].map((item, i) => (
                <Link
                  key={item.subject}
                  to={`/materials?subject=${item.subject}`}
                  className={`group p-8 bg-surface-2 rounded-xl border border-border/40 hover:border-${item.color}/40 hover:shadow-lg hover:shadow-${item.color}/10 transition-all duration-300 card-glow scroll-reveal scroll-reveal-delay-${i + 1}`}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${item.color}/10 text-${item.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className={`font-display font-bold text-xl mb-2 text-foreground group-hover:text-${item.color} transition-colors duration-300 capitalize`}>{item.subject}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <span className="text-xs text-muted-foreground/70">{item.books}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pinch-bar mt-12">
            <span className="pinch-bar-line" />
          </div>
        </section>

        {/* Why BOOKIE Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center mb-12 scroll-reveal">
                <span className="pill mb-4 shadow-sm">
                  <Shield className="h-3 w-3" />
                  Our Promise
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Why <span className="text-gradient-glow">BOOKIE</span>?
                </h2>
                <p className="text-muted-foreground text-sm max-w-md flex items-center justify-center gap-2">
                  <span className="w-4 h-px bg-border/50" />
                  Built with intention, not just features
                  <span className="w-4 h-px bg-border/50" />
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { icon: Target, title: "Curated Resources", desc: "Carefully selected materials from trusted sources.", badge: "Verified quality" },
                  { icon: Sparkles, title: "Clean Interface", desc: "No clutter. Find what you need, fast.", badge: "Zero distractions" },
                  { icon: Shield, title: "Always Updated", desc: "Regular updates with new materials.", badge: "Fresh content" },
                ].map((item, i) => (
                  <div key={item.title} className={`group p-6 bg-surface-1 rounded-xl border border-border/30 text-center card-glow scroll-reveal scroll-reveal-delay-${i + 1}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                      <CheckCircle className="h-3 w-3" />
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-14 p-6 bg-surface-1 rounded-xl border border-border/30 scroll-reveal">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                  {["Clarity", "Focus", "Consistency"].map((word, i) => (
                    <div key={word} className="flex items-center gap-2">
                      {i > 0 && <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{word}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-muted-foreground/80 text-sm mt-4">
                  Built for serious aspirants who value quality over quantity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
