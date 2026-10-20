import React from "react";
import { Layout } from "@/components/Layout";
import { Coffee, Heart, ArrowUpRight, BookOpen, Server, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const DONATE_URL = "https://bookieupi.lovable.app/";

const Donate = () => {
  return (
    <Layout>
      <section className="bg-background min-h-screen text-foreground relative overflow-hidden pb-24">
        <div className="container mx-auto px-4 py-12 md:py-20 relative max-w-5xl">
          <div className="flex flex-col items-center">
            {/* Eyebrow */}
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center gap-2 rounded-md border-2 border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold text-foreground shadow-[2px_2px_0px_var(--desk-border)]">
                <Coffee className="h-3.5 w-3.5 text-primary" />
                Community Server Fuel
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground text-center leading-tight mb-4">
              BUY US A <span className="text-primary underline decoration-primary/40 decoration-wavy underline-offset-4">chai.</span>
            </h1>
            <p className="text-sm md:text-base font-sans text-muted-foreground font-medium text-center max-w-2xl mx-auto leading-relaxed">
              BOOKIE is a one-person, completely free project — built late at night, fueled by cutting chai and stubborn refusal to let exam preparation cost a fortune. If it helped your prep, a small contribution keeps the servers running.
            </p>

            {/* The Tactile Card */}
            <div className="mt-10 w-full max-w-xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card shadow-[6px_6px_0px_var(--desk-border)] p-8 md:p-10 text-center">
                <div className="relative z-10">
                  {/* Animated chai cup */}
                  <div className="relative inline-flex mb-6">
                    <div className="h-20 w-20 rounded-2xl border-2 border-border bg-muted text-primary flex items-center justify-center shadow-[3px_3px_0px_var(--desk-border)] group-hover:rotate-[-6deg] transition-transform">
                      <Coffee className="h-10 w-10" />
                    </div>
                  </div>

                  <h2 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2">
                    Support BOOKIE on{" "}
                    <span className="text-primary block sm:inline">Buy Me a Chai</span>
                  </h2>
                  <p className="text-xs sm:text-sm font-sans text-muted-foreground max-w-md mx-auto mb-8">
                    Homegrown Indian alternative. Quick, secure via UPI, no account needed.
                  </p>

                  {/* CTA */}
                  <a
                    href={DONATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border-2 border-border bg-primary text-primary-foreground font-sans font-bold text-base shadow-[3px_3px_0px_var(--desk-border)] hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <Coffee className="h-5 w-5" />
                    <span>Buy me a Chai</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>

                  <div className="mt-5 flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span>Direct UPI: bookieupi.lovable.app</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Where the chai goes */}
            <div className="mt-14 w-full max-w-4xl">
              <h3 className="font-display font-bold text-xl text-center mb-6 text-foreground">
                Where your contribution goes
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <PerkCard
                  icon={Server}
                  title="Server Infrastructure"
                  desc="High-speed caching, PostgreSQL DB, and reliable study carrel sync."
                />
                <PerkCard
                  icon={BookOpen}
                  title="PYQ & Mock Digitization"
                  desc="Digitizing authentic Kota test papers and exam answer keys."
                />
                <PerkCard
                  icon={Users}
                  title="Free Forever Commitment"
                  desc="Zero ₹2.5 Lakh paywalls, zero predatory locking. Always open."
                />
              </div>
            </div>

            {/* Closing note */}
            <div className="mt-12 text-center">
              <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-border rounded-xl px-5 py-2 bg-muted max-w-fit mx-auto shadow-[2px_2px_0px_var(--desk-border)]">
                <span>Even ₹20 means the world. Thank you, aspirant.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function PerkCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-5 shadow-[3px_3px_0px_var(--desk-border)] hover:shadow-[5px_5px_0px_var(--desk-border)] hover:-translate-y-0.5 transition-all">
      <div className="h-10 w-10 rounded-lg border-2 border-border bg-muted flex items-center justify-center mb-3 shadow-[1px_1px_0px_var(--desk-border)]">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-display font-bold text-sm text-foreground mb-1.5">{title}</h3>
      <p className="text-xs font-sans text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

export default Donate;