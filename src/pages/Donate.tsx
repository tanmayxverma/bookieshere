import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Coffee, Heart, Sparkles, ArrowUpRight, BookOpen, Server, Users } from "lucide-react";

const DONATE_URL = "https://buymeachai.ezee.li/tanmay";

const Donate = () => {
  return (
    <Layout>
      <section className="relative overflow-hidden">
        {/* Ambient glows */}
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute top-20 right-0 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.06),transparent_60%)]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto">
            {/* Eyebrow */}
            <div className="flex justify-center mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2/60 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                <Heart className="h-3 w-3 text-primary fill-primary" />
                A small thank you goes a long way
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-foreground text-center leading-[0.95] mb-5 animate-fade-in">
              Buy us a{" "}
              <span className="relative inline-block">
                <span className="italic font-medium text-muted-foreground">chai</span>
                <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed animate-fade-in">
              BOOKIE is a one-person, fully free project — built late at night, fueled by chai. If it's helped you in your JEE prep, a small contribution keeps the servers running and new material flowing.
            </p>

            {/* The Card */}
            <div className="mt-12 group relative animate-fade-in">
              <div aria-hidden className="absolute -inset-2 bg-gradient-to-br from-primary/30 via-amber-500/20 to-accent/20 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-[0_40px_100px_-30px_hsl(var(--primary)/0.4)]">
                {/* top gradient line */}
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                {/* glow blobs inside */}
                <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity" />
                <div aria-hidden className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

                <div className="relative p-8 md:p-12 text-center">
                  {/* Animated chai cup */}
                  <div className="relative inline-flex mb-6">
                    <div aria-hidden className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-20 w-20 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-amber-500/10 to-accent/10 backdrop-blur flex items-center justify-center shadow-[inset_0_1px_0_hsl(var(--background)/0.4)]">
                      <Coffee className="h-10 w-10 text-primary group-hover:rotate-[-8deg] transition-transform duration-500" />
                      {/* Steam */}
                      <span aria-hidden className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="block w-1 h-3 rounded-full bg-primary/40 animate-pulse" />
                        <span className="block w-1 h-4 rounded-full bg-primary/30 animate-pulse [animation-delay:0.15s]" />
                        <span className="block w-1 h-3 rounded-full bg-primary/40 animate-pulse [animation-delay:0.3s]" />
                      </span>
                    </div>
                  </div>

                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                    Support BOOKIE on{" "}
                    <span className="text-primary">Buy Me a Chai</span>
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                    A homegrown Indian alternative to Buy Me a Coffee. Quick, secure, no account needed.
                  </p>

                  {/* CTA */}
                  <a
                    href={DONATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-foreground text-background font-semibold text-base shadow-[0_15px_40px_-10px_hsl(var(--primary)/0.6)] hover:shadow-[0_20px_50px_-10px_hsl(var(--primary)/0.8)] transition-all hover:scale-[1.02]"
                  >
                    <Coffee className="h-5 w-5" />
                    Buy me a Chai
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:rotate-45" />
                  </a>

                  <div className="mt-5 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    <Sparkles className="h-3 w-3 text-primary" />
                    buymeachai.ezee.li/tanmay
                  </div>
                </div>
              </div>
            </div>

            {/* Where the chai goes */}
            <div className="mt-16 grid sm:grid-cols-3 gap-4">
              <PerkCard icon={Server} title="Server costs" desc="Hosting, database, AI APIs running 24/7." />
              <PerkCard icon={BookOpen} title="New material" desc="More PYQs, modules, test series — every week." />
              <PerkCard icon={Users} title="Free for everyone" desc="So no aspirant ever hits a paywall here." />
            </div>

            {/* Closing note */}
            <p className="mt-12 text-center text-sm text-muted-foreground/80 italic max-w-xl mx-auto">
              Even ₹20 means the world. Thank you for keeping BOOKIE alive. 🍵
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function PerkCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-5 transition-all hover:border-primary/30 hover:bg-card/60">
      <div className="h-10 w-10 rounded-xl border border-border/40 bg-surface-2/50 flex items-center justify-center mb-3 group-hover:border-primary/40 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

export default Donate;