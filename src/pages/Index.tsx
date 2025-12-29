import { Link } from "react-router-dom";
import { BookOpen, Download, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Your Study Material Companion</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              BOOKIE
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              Organized. Simple. Student-Focused.
            </p>
            
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              All competitive exam PCM study materials in one place. 
              Books, notes, PYQs, and practice sheets for JEE and other competitive exams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/materials">
                  <BookOpen className="h-5 w-5" />
                  Browse Materials
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/how-to-download">
                  <Download className="h-5 w-5" />
                  How to Download
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/support">
                  <MessageCircle className="h-5 w-5" />
                  Chat Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-physics/10 text-physics mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Physics</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive study materials for mechanics, thermodynamics, optics, and more.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-chemistry/10 text-chemistry mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Chemistry</h3>
              <p className="text-muted-foreground text-sm">
                Organic, inorganic, and physical chemistry resources for exam preparation.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mathematics/10 text-mathematics mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Mathematics</h3>
              <p className="text-muted-foreground text-sm">
                Calculus, algebra, coordinate geometry, and problem-solving materials.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;