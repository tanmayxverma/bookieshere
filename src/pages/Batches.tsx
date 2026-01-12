import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { OptimizedImage } from "@/components/OptimizedImage";
import arjunaImage from "@/assets/arjuna-jee-2027.png";
import lakshyaImage from "@/assets/lakshya-jee-2027.png";

const batches = [
  {
    title: "Arjuna JEE 2027",
    subtitle: "Complete JEE Preparation Package",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    image: arjunaImage,
    link: "https://t.me/+_IBf4DPaq0RiOWY1",
  },
  {
    title: "Lakshya JEE 2027",
    subtitle: "Comprehensive JEE Study Program",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    image: lakshyaImage,
    link: "https://t.me/+-KXICKXs3XYyZjc1",
  },
];

const Batches = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Available <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Batches</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Access comprehensive JEE preparation batches with video lectures, practice materials, and more.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-3">
            This link redirects to an external platform. BOOKIE does not host, control, or store any files.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {batches.map((batch, index) => (
            <div
              key={index}
              className={`group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-3 hover:scale-[1.02] card-glow opacity-0 animate-fade-in-up ${
                index === 0 ? "stagger-1" : "stagger-2"
              }`}
            >
              {/* Image with optimized loading */}
              <OptimizedImage
                src={batch.image}
                alt={batch.title}
                className="aspect-video"
              />
              
              {/* Overlay gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                    {batch.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {batch.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {batch.includes.map((item, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary/80 transition-colors duration-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Button 
                  asChild 
                  className="w-full gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 btn-press transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-[1.02]"
                >
                  <a href={batch.link} target="_blank" rel="noopener noreferrer">
                    Explore Batch
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-muted-foreground mt-10 max-w-lg mx-auto opacity-0 animate-fade-in stagger-3">
          These batches are hosted externally on Telegram. BOOKIE curates and shares these resources but does not host video lectures directly.
        </p>

        {/* Bottom Protection Line */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center max-w-lg mx-auto opacity-0 animate-fade-in stagger-4">
          <p className="text-xs text-muted-foreground">
            All materials are shared strictly for educational purposes. © Respective owners. This website does not host any files.{" "}
            <Link to="/copyright-terms" className="text-primary hover:underline">
              Copyright & Terms
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Batches;
