import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Sparkles, Target, Shield, CheckCircle, FileText, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  const scrollRef = useScrollReveal();

  return (
    <Layout>
      <div ref={scrollRef}>
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-8 md:pt-12">
          <div className="hero-glow" />
          <div className="hero-glow-secondary" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="opacity-0 animate-fade-in">
                <span className="pill pill-hero shadow-sm shadow-primary/10">
                  <Sparkles className="h-3 w-3" />
                  Trusted by serious aspirants
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black tracking-tight opacity-0 animate-fade-in stagger-1">
                <span className="text-gradient-glow">BOOKIE</span>
              </h1>
              
              <div className="space-y-4 opacity-0 animate-fade-in stagger-2">
                <p className="text-xl md:text-2xl text-foreground max-w-2xl mx-auto leading-relaxed font-semibold">
                  One trusted platform for{" "}
                  <span className="text-emphasis">JEE materials</span>, tests, and guidance.
                </p>
                <p className="text-base text-muted-foreground max-w-xl mx-auto flex items-center justify-center gap-2">
                  <span className="w-8 h-px bg-border/60" />
                  Built for serious aspirants who value clarity and focus.
                  <span className="w-8 h-px bg-border/60" />
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6 opacity-0 animate-fade-in stagger-3 flex-wrap">
                <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/85 shadow-lg shadow-primary/20 btn-press btn-lift px-8">
                  <Link to="/materials">
                    <BookOpen className="h-5 w-5" />
                    Browse Materials
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/85 shadow-lg shadow-primary/20 btn-press btn-lift px-8">
                  <Link to="/tests">
                    <FileText className="h-5 w-5" />
                    Practice Tests
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/85 shadow-lg shadow-primary/20 btn-press btn-lift px-8">
                  <Link to="/support">
                    <HeadphonesIcon className="h-5 w-5" />
                    Chat Support
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="pt-10 md:pt-12 opacity-0 animate-fade-in stagger-4">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="w-12 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">Trusted Platform</span>
                  <span className="w-12 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground/60">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary/50" />
                    Free access
                  </span>
                  <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border/40" />
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary/50" />
                    No signup required
                  </span>
                  <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border/40" />
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary/50" />
                    Daily updates
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <div className="pinch-bar opacity-0 animate-fade-in stagger-5">
              <span className="pinch-bar-line" />
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
