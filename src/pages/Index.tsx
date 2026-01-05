import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ActionStrip } from "@/components/ActionStrip";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 tracking-tight">
              BOOKIE
            </h1>
            
            <p className="text-lg md:text-xl text-foreground mb-2 max-w-2xl mx-auto leading-relaxed font-medium">
              One trusted platform for JEE materials, batches, tests, and guidance.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Built for serious aspirants who value clarity.
            </p>

            <Button asChild size="lg" className="gap-2">
              <Link to="/materials">
                <BookOpen className="h-5 w-5" />
                Browse Materials
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Guided Action Strip */}
      <ActionStrip variant="mid" />

      {/* Explore Subjects Section */}
      <section className="py-16 bg-section border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Explore Subjects
            </h2>
            <p className="text-muted-foreground">
              Select a subject to browse related study materials.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              to="/materials?subject=physics"
              className="group p-8 bg-card rounded-xl border border-border hover:border-physics/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-physics/10 text-physics mb-4 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Physics</h3>
              <p className="text-muted-foreground text-sm">
                Mechanics, thermodynamics, electromagnetism, optics, and more.
              </p>
            </Link>
            
            <Link
              to="/materials?subject=chemistry"
              className="group p-8 bg-card rounded-xl border border-border hover:border-chemistry/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-chemistry/10 text-chemistry mb-4 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Chemistry</h3>
              <p className="text-muted-foreground text-sm">
                Organic, inorganic, and physical chemistry resources.
              </p>
            </Link>
            
            <Link
              to="/materials?subject=mathematics"
              className="group p-8 bg-card rounded-xl border border-border hover:border-mathematics/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-mathematics/10 text-mathematics mb-4 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Mathematics</h3>
              <p className="text-muted-foreground text-sm">
                Calculus, algebra, coordinate geometry, and problem sets.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Why BOOKIE?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              BOOKIE is built to support serious JEE aspirants with reliable, high-quality resources.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Materials, batches, tests, and guidance are carefully curated and organised to keep preparation simple, focused, and effective.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Built for serious aspirants who value clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Action Strip */}
      <ActionStrip variant="bottom" />
    </Layout>
  );
};

export default Index;
