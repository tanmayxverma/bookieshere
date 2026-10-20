import React from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Coffee, Heart, Sparkles, ArrowUpRight, BookOpen, Server, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const DONATE_URL = "https://bookieupi.lovable.app/";

const Donate = () => {
  return (
    <Layout>
      <section className="bg-background blueprint-grid min-h-screen text-on-surface relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 relative max-w-5xl">
          <div className="flex flex-col items-center">
            {/* Eyebrow */}
            <div className="flex justify-center mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-on-surface bg-secondary-container px-3.5 py-1.5 text-[11px] font-label-code-sm uppercase tracking-wider font-bold text-on-secondary-container shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                <span className="text-sm">☕</span>
                Fuel The Late Night Hustle
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-headline-xl text-4xl md:text-6xl font-black tracking-tight text-on-surface text-center leading-tight mb-5 animate-fade-in">
              BUY US A <span className="italic relative z-10 font-headline-xl">chai.</span>
            </h1>
            <p className="text-base md:text-lg font-body-lg text-on-surface-variant font-medium text-center max-w-2xl mx-auto leading-relaxed animate-fade-in">
              BOOKIE is a one-person, fully free project — built late at night, fueled by cutting chai and stubborn refusal to let education cost a fortune. If it's helped you in your JEE prep, a small contribution keeps the servers alive.
            </p>

            {/* The Card */}
            <div className="mt-12 w-full max-w-2xl group animate-fade-in mx-auto">
              <div className="relative overflow-hidden rounded-3xl border-2 border-on-surface bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(19,27,46,1)] p-8 md:p-12 text-center transition-transform hover:-translate-y-1">
                
                {/* Decorative cutouts */}
                <div aria-hidden className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-2 border-on-surface bg-secondary shadow-[inset_4px_4px_0_0_rgba(255,255,255,0.4)] opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                <div aria-hidden className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border-2 border-on-surface bg-primary shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.2)] opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />

                <div className="relative z-10">
                  {/* Animated chai cup */}
                  <div className="relative inline-flex mb-8">
                    <div className="h-20 w-20 rounded-2xl border-2 border-on-surface bg-primary-container text-on-primary-container flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] group-hover:rotate-[-6deg] transition-transform duration-500">
                      <Coffee className="h-10 w-10" />
                      {/* Steam */}
                      <span aria-hidden className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="block w-1.5 h-4 rounded-full bg-on-surface animate-pulse" />
                        <span className="block w-1.5 h-6 rounded-full bg-on-surface animate-pulse [animation-delay:0.15s]" />
                        <span className="block w-1.5 h-4 rounded-full bg-on-surface animate-pulse [animation-delay:0.3s]" />
                      </span>
                    </div>
                  </div>

                  <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight mb-3">
                    Support BOOKIE on{" "}
                    <span className="text-primary block sm:inline">Buy Me a Chai</span>
                  </h2>
                  <p className="text-sm font-body-md font-medium text-on-surface-variant max-w-md mx-auto mb-10">
                    A homegrown Indian alternative to Buy Me a Coffee. Quick, secure via UPI, no account needed.
                  </p>

                  {/* CTA */}
                  <a
                    href={DONATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-on-surface bg-primary text-on-primary font-bold font-headline-md text-lg shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                  >
                    <span className="text-xl">☕</span>
                    Buy me a Chai
                    <ArrowUpRight className="h-5 w-5 transition-transform group-hover/cta:rotate-45 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
                  </a>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-label-code-sm uppercase tracking-wider font-bold text-primary">
                    <Sparkles className="h-4 w-4" />
                    bookieupi.lovable.app
                  </div>
                </div>
              </div>
            </div>

            {/* Where the chai goes */}
            <div className="mt-16 w-full max-w-4xl">
              <h3 className="font-headline-md font-bold text-xl text-center mb-8 text-on-surface">Where your support goes</h3>
              <div className="grid sm:grid-cols-3 gap-5">
                <PerkCard icon={Server} title="Server Costs" desc="High-speed Redis cache, PostgreSQL DB, and APIs running 24/7." variant="blue" />
                <PerkCard icon={BookOpen} title="Test Scanners" desc="Digitizing top Kota mock tests and generating instant solutions." variant="amber" />
                <PerkCard icon={Users} title="Free Forever" desc="No ₹2.5 Lakh paywalls, no predatory subscriptions. Ever." variant="green" />
              </div>
            </div>

            {/* Closing note */}
            <div className="mt-16 text-center">
              <p className="text-xs font-label-code-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-on-surface border-dashed rounded-full px-6 py-2 bg-surface-container-low max-w-fit mx-auto">
                <span>Even ₹20 means the world. Thank you.</span>
                <span className="text-base">🍵</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function PerkCard({ icon: Icon, title, desc, variant }: { icon: React.ElementType; title: string; desc: string, variant: 'blue' | 'amber' | 'green' }) {
  const variants = {
    blue: {
      bg: "bg-primary-container",
      icon: "text-on-primary-container",
      hover: "hover:bg-primary-fixed"
    },
    amber: {
      bg: "bg-secondary-container",
      icon: "text-on-secondary-container",
      hover: "hover:bg-secondary-fixed"
    },
    green: {
      bg: "bg-tertiary-container",
      icon: "text-on-tertiary-container",
      hover: "hover:bg-tertiary-fixed"
    }
  };

  return (
    <div className={cn(
      "group relative rounded-2xl border-2 border-on-surface bg-surface-container-lowest p-6 transition-all duration-300",
      "shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:shadow-[6px_6px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-1"
    )}>
      <div className={cn(
        "h-12 w-12 rounded-xl border-2 border-on-surface flex items-center justify-center mb-4 transition-colors",
        variants[variant].bg,
        variants[variant].hover
      )}>
        <Icon className={cn("h-6 w-6", variants[variant].icon)} />
      </div>
      <h3 className="font-bold text-base font-headline-md text-on-surface mb-2">{title}</h3>
      <p className="text-sm font-body-sm font-medium text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}

export default Donate;