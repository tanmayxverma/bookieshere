import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, MessageCircle, Sparkles, Target, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section - Vertically centered in viewport */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        {/* Hero background glow - enhanced with multiple layers */}
        <div className="hero-glow" />
        <div className="hero-glow-secondary" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Brand pill with breathing - ONLY hero pill breathes */}
            <div className="opacity-0 animate-fade-in">
              <span className="pill pill-hero shadow-sm shadow-primary/10">
                <Sparkles className="h-3 w-3" />
                Trusted by serious aspirants
              </span>
            </div>

            {/* Heavy headline with glow depth */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black tracking-tight opacity-0 animate-fade-in stagger-1">
              <span className="text-gradient-glow">
                BOOKIE
              </span>
            </h1>
            
            {/* Treated tagline with enriched emphasis */}
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

            {/* CTA Group with enriched layout */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6 opacity-0 animate-fade-in stagger-3">
              <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 btn-press transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 px-8">
                <Link to="/materials">
                  <BookOpen className="h-5 w-5" />
                  Browse Materials
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-surface-2 btn-press transition-all duration-200 hover:-translate-y-0.5 border-border/60">
                <Link to="/support">
                  <MessageCircle className="h-4 w-4" />
                  Support
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators strip */}
            <div className="pt-8 opacity-0 animate-fade-in stagger-4">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-primary/60" />
                  Free access
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-primary/60" />
                  No signup required
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-primary/60" />
                  Daily updates
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section divider - anchored at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="pinch-bar opacity-0 animate-fade-in stagger-5">
            <span className="pinch-bar-line" />
          </div>
        </div>
      </section>

      {/* Explore Subjects Section - Surface Level 1 with enhanced richness */}
      <section className="py-20 bg-surface-1 border-y border-border/30 relative">
        {/* Subtle section glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center mb-12 opacity-0 animate-fade-in">
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
            {/* Physics Card */}
            <Link
              to="/materials?subject=physics"
              className="group p-8 bg-surface-2 rounded-xl border border-border/40 hover:border-physics/40 hover:shadow-lg hover:shadow-physics/10 transition-all duration-300 card-glow opacity-0 animate-fade-in stagger-1 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-physics/10 text-physics mb-5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground group-hover:text-physics transition-colors duration-300">Physics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Mechanics, thermodynamics, electromagnetism, optics, and more.
              </p>
              {/* Card enrichment */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground/70">HC Verma, Irodov, DC Pandey</span>
              </div>
            </Link>
            
            {/* Chemistry Card */}
            <Link
              to="/materials?subject=chemistry"
              className="group p-8 bg-surface-2 rounded-xl border border-border/40 hover:border-chemistry/40 hover:shadow-lg hover:shadow-chemistry/10 transition-all duration-300 card-glow opacity-0 animate-fade-in stagger-2 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-chemistry/10 text-chemistry mb-5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground group-hover:text-chemistry transition-colors duration-300">Chemistry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Organic, inorganic, and physical chemistry resources.
              </p>
              {/* Card enrichment */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground/70">MS Chouhan, VK Jaiswal, N Avasthi</span>
              </div>
            </Link>
            
            {/* Mathematics Card */}
            <Link
              to="/materials?subject=mathematics"
              className="group p-8 bg-surface-2 rounded-xl border border-border/40 hover:border-mathematics/40 hover:shadow-lg hover:shadow-mathematics/10 transition-all duration-300 card-glow opacity-0 animate-fade-in stagger-3 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-mathematics/10 text-mathematics mb-5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground group-hover:text-mathematics transition-colors duration-300">Mathematics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Calculus, algebra, coordinate geometry, and problem sets.
              </p>
              {/* Card enrichment */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground/70">Cengage, Black Book, Amit Agarwal</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Section exit divider */}
        <div className="pinch-bar mt-12">
          <span className="pinch-bar-line" />
        </div>
      </section>

      {/* Why BOOKIE Section - Surface Level 0 with enhanced richness */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Section header - aligned center */}
            <div className="flex flex-col items-center text-center mb-12 opacity-0 animate-fade-in">
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

            {/* Content cards grid with enhanced depth */}
            <div className="grid sm:grid-cols-3 gap-5 opacity-0 animate-fade-in stagger-1">
              <div className="group p-6 bg-surface-1 rounded-xl border border-border/30 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">Curated Resources</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Carefully selected materials from trusted sources.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                  <CheckCircle className="h-3 w-3" />
                  Verified quality
                </span>
              </div>

              <div className="group p-6 bg-surface-1 rounded-xl border border-border/30 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">Clean Interface</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  No clutter. Find what you need, fast.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                  <CheckCircle className="h-3 w-3" />
                  Zero distractions
                </span>
              </div>

              <div className="group p-6 bg-surface-1 rounded-xl border border-border/30 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">Always Updated</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Regular updates with new materials.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                  <CheckCircle className="h-3 w-3" />
                  Fresh content
                </span>
              </div>
            </div>

            {/* Bottom commitment strip */}
            <div className="mt-14 p-6 bg-surface-1 rounded-xl border border-border/30 opacity-0 animate-fade-in stagger-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Clarity</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Focus</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Consistency</span>
                </div>
              </div>
              <p className="text-center text-muted-foreground/80 text-sm mt-4">
                Built for serious aspirants who value quality over quantity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
