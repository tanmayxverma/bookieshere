import { Link } from "react-router-dom";
import {
  MessageCircle, ExternalLink, Send, AlertCircle, FileWarning,
  Link2Off, HelpCircle, Headphones, BookOpen, ClipboardList,
  ArrowRight, ArrowUpRight, Sparkles, Clock, ShieldCheck, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const supportUses = [
  { icon: Link2Off, title: "Report Broken Links", description: "If a resource link isn't working or redirects incorrectly, let us know." },
  { icon: FileWarning, title: "File Opening Issues", description: "Having trouble opening or viewing a resource? We can help." },
  { icon: AlertCircle, title: "Access Problems", description: "If accessing a resource isn't working as expected, report it." },
  { icon: HelpCircle, title: "Technical Assistance", description: "Any other technical issues with the platform or materials." },
];

const Support = () => {
  const telegramBotLink = "https://t.me/tellurdemandsbot";

  return (
    <Layout>
      <section className="relative overflow-hidden">
        {/* Ambient glows — editorial glass premium */}
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute top-40 right-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto">
            {/* HERO */}
            <div className="text-center mb-14 animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-2/60 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur mb-6">
                <Sparkles className="h-3 w-3 text-primary" />
                Help Desk
              </span>

              {/* Animated chat-bubble medallion */}
              <div className="relative inline-flex mb-7">
                <div aria-hidden className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl opacity-70" />
                <div className="relative h-20 w-20 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card/40 to-accent/10 backdrop-blur flex items-center justify-center shadow-[inset_0_1px_0_hsl(var(--background)/0.4)]">
                  <Headphones className="h-9 w-9 text-primary" />
                  <span aria-hidden className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-background shadow-[0_0_12px_hsl(var(--primary))] animate-pulse" />
                </div>
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[0.95] mb-5">
                We're{" "}
                <span className="relative inline-block">
                  <span className="italic font-medium text-muted-foreground">listening</span>
                  <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                </span>
                .
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Hit a snag with a resource, the test engine, or anything else? Drop a line — a real human reads every message.
              </p>

              {/* Status chips */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                <Chip icon={Zap} text="Avg. reply < 24h" />
                <Chip icon={ShieldCheck} text="Private & secure" />
                <Chip icon={Clock} text="Mon–Sun" />
              </div>
            </div>

            {/* PRIMARY CTA — Liquid glass hero card */}
            <div className="group relative animate-fade-in">
              <div aria-hidden className="absolute -inset-2 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-[0_40px_100px_-30px_hsl(var(--primary)/0.4)]">
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity" />

                <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-8 p-7 md:p-10">
                  {/* Floating chat bubbles */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold tracking-[0.16em] uppercase text-primary">
                        <MessageCircle className="h-2.5 w-2.5" /> Chat Support
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-emerald-500 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                      Talk to us on <span className="text-primary">Telegram</span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                      Fast, threaded, and on the app you already use. Open a chat — we'll take it from there.
                    </p>

                    {/* Chat preview */}
                    <div className="mt-6 space-y-2 max-w-md">
                      <ChatBubble side="them" text="Hi! Link to module isn't loading?" />
                      <ChatBubble side="us" text="On it — sending you a fresh mirror in 2 mins." />
                    </div>
                  </div>

                  {/* CTA stack */}
                  <div className="flex flex-col items-stretch md:items-end gap-2 shrink-0">
                    <a
                      href={telegramBotLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/cta inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-foreground text-background font-semibold text-base shadow-[0_15px_40px_-10px_hsl(var(--primary)/0.6)] hover:shadow-[0_20px_50px_-10px_hsl(var(--primary)/0.8)] transition-all hover:scale-[1.02] whitespace-nowrap"
                    >
                      <Send className="h-4.5 w-4.5" />
                      Open Chat
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:rotate-45" />
                    </a>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 text-center md:text-right">t.me/tellurdemandsbot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT WE HELP WITH */}
            <div className="mt-14 animate-fade-in">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                  <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                  What we help with
                </h2>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">04 areas</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {supportUses.map((item, idx) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-5 transition-all hover:border-primary/30 hover:bg-card/60 hover:-translate-y-0.5"
                  >
                    <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex gap-4">
                      <div className="shrink-0 h-11 w-11 rounded-xl border border-border/40 bg-surface-2/50 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 font-semibold">{String(idx + 1).padStart(2, "0")}</span>
                          <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="mt-14 animate-fade-in">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-3 mb-6">
                <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                Maybe you were looking for…
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <QuickLink to="/materials" icon={BookOpen} title="Materials Library" desc="Curated JEE resources" />
                <QuickLink to="/tests" icon={ClipboardList} title="Practice Tests" desc="JEE-pattern mock tests" />
              </div>
            </div>

            {/* Footer note */}
            <p className="mt-14 text-center text-xs text-muted-foreground/70 italic">
              Real human, real reply. We don't outsource conversations.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

/* ---------- Local helpers ---------- */

function Chip({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-surface-2/50 backdrop-blur px-2.5 py-1 text-[11px] text-muted-foreground">
      <Icon className="h-3 w-3 text-primary" />
      {text}
    </span>
  );
}

function ChatBubble({ side, text }: { side: "them" | "us"; text: string }) {
  const isUs = side === "us";
  return (
    <div className={`flex ${isUs ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
          isUs
            ? "bg-primary/15 border border-primary/30 text-foreground rounded-br-sm"
            : "bg-surface-2/70 border border-border/40 text-muted-foreground rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-5 transition-all hover:border-primary/40 hover:bg-card/60 hover:shadow-[0_15px_40px_-15px_hsl(var(--primary)/0.4)]"
    >
      <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative h-11 w-11 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="relative flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="relative h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export default Support;
