import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import arjunaImage from "@/assets/arjuna-jee-2027.png";
import lakshyaImage from "@/assets/lakshya-jee-2027.png";

const batches = [
  {
    title: "Arjuna JEE 2027",
    subtitle: "Complete JEE Preparation Package",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    image: arjunaImage,
    link: "https://t.me/arjunajee2027batch",
  },
  {
    title: "Lakshya JEE 2027",
    subtitle: "Comprehensive JEE Study Program",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    image: lakshyaImage,
    link: "https://t.me/lakshayajee2027",
  },
];

const Batches = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Available <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Batches</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Access comprehensive JEE preparation batches with video lectures, practice materials, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {batches.map((batch, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={batch.image}
                  alt={batch.title}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">
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
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Button asChild className="w-full gap-2 group-hover:bg-primary/90">
                  <a href={batch.link} target="_blank" rel="noopener noreferrer">
                    Explore Batch
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-muted-foreground mt-10 max-w-lg mx-auto">
          These batches are hosted externally on Telegram. BOOKIE curates and shares these resources but does not host video lectures directly.
        </p>
      </div>
    </Layout>
  );
};

export default Batches;
