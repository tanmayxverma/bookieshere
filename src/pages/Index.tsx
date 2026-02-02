import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, MessageCircle, Sparkles, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section - Surface Level 0 */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Brand pill */}
            <div className="opacity-0 animate-fade-in">
              <span className="pill pill-primary">
                <Sparkles className="h-3 w-3" />
                Trusted by serious aspirants
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-primary via-blue-400 to-violet-500 bg-clip-text text-transparent opacity-0 animate-fade-in stagger-1">
              BOOKIE
            </h1>
            
            <div className="space-y-3 opacity-0 animate-fade-in stagger-2">
              <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                One trusted platform for JEE materials, tests, and guidance.
              </p>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Built for serious aspirants who value clarity and focus.
              </p>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2 opacity-0 animate-fade-in stagger-3">
              <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 btn-press transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                <Link to="/materials">
                  <BookOpen className="h-5 w-5" />
                  Browse Materials
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-surface-2 btn-press transition-all duration-200 hover:-translate-y-0.5">
                <Link to="/support">
                  <MessageCircle className="h-4 w-4" />
                  Support
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="pinch-bar mt-12 opacity-0 animate-fade-in stagger-4">
          <span className="pinch-bar-line" />
        </div>
      </section>

      {/* Explore Subjects Section - Surface Level 1 */}
      <section className="py-16 bg-surface-1 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 opacity-0 animate-fade-in">
            <span className="pill mb-4">
              <Target className="h-3 w-3" />
              Core Subjects
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Explore <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Subjects</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Select a subject to browse curated study materials designed for JEE preparation.
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
      </section>

      {/* Why BOOKIE Section - Surface Level 0 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10 opacity-0 animate-fade-in">
              <span className="pill mb-4">
                <Shield className="h-3 w-3" />
                Our Promise
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Why <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">BOOKIE</span>?
              </h2>
            </div>

            {/* Content cards grid */}
            <div className="grid sm:grid-cols-3 gap-4 opacity-0 animate-fade-in stagger-1">
              <div className="p-6 bg-surface-1 rounded-xl border border-border/30 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm">Curated Resources</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Carefully selected materials from trusted sources.
                </p>
              </div>

              <div className="p-6 bg-surface-1 rounded-xl border border-border/30 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm">Clean Interface</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No clutter. Find what you need, fast.
                </p>
              </div>

              <div className="p-6 bg-surface-1 rounded-xl border border-border/30 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm">Always Updated</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Regular updates with new materials.
                </p>
              </div>
            </div>

            {/* Bottom text anchor */}
            <div className="mt-10 text-center opacity-0 animate-fade-in stagger-2">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Built for serious aspirants who value <span className="text-foreground font-medium">clarity</span>, <span className="text-foreground font-medium">focus</span>, and <span className="text-foreground font-medium">consistency</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
