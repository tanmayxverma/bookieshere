import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Coffee, ArrowUpRight, Copy, Check, Server, BookOpen, Lock, ShieldCheck, Dns, CheckCircle2 } from "lucide-react";

const DONATE_URL = "https://bookieupi.lovable.app/";
const UPI_HANDLE = "bookieupi.lovable.app";

export default function Donate() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_HANDLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="bg-academic-grid min-h-screen text-foreground relative overflow-hidden pb-24">
        {/* Archival Volume Strip (Stitch Screen 12) */}
        <div className="w-full bg-background/60 border-b border-border/80 text-muted-foreground py-1 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
            <div className="flex items-center space-x-3">
              <span className="text-primary font-bold">VOL. IX — ISSUE 4</span>
              <span className="text-muted-foreground/30">|</span>
              <span>EST. 2024</span>
              <span className="hidden sm:inline text-muted-foreground/30">|</span>
              <span className="hidden sm:inline">ARCHIVAL REGISTER: ACAD-JEE-NEET-771</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-foreground font-semibold">SYS STATUS: ALL ARCHIVES OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Main Editorial Container */}
        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 flex flex-col items-center">
          {/* Overline Badge (Scholarly Seal Pill) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/60 text-muted-foreground rounded-full border border-border/80 shadow-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-semibold">
              § Archival Patronage // Fuel The Late Night Sprint
            </span>
          </div>

          {/* Editorial Masthead Headline */}
          <h1 className="text-center font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            BUY US A <span className="font-serif italic text-primary underline decoration-primary/40 underline-offset-8">chai.</span>
          </h1>

          {/* Manifesto / Subtitle */}
          <p className="max-w-2xl text-center font-sans text-sm sm:text-base text-muted-foreground leading-relaxed mb-12">
            <strong className="text-foreground font-semibold">BOOKIE</strong> is an independent, non-commercial archival project — forged in late-night sessions over cutting chai, anchored by an uncompromising refusal to let rank preparation cost a fortune. If this journal aids your JEE or NEET discipline, an offering keeps the indexers and compute nodes awake.
          </p>

          {/* Central Patronage Sheet (Hero Donation Card - Stitch Screen 12) */}
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden relative mb-16">
            {/* Card Top Archival Header Bar */}
            <div className="w-full bg-muted/40 px-6 py-3 flex justify-between items-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>LEDGER ID: CHAI-IND-2025</span>
              </div>
              <div className="flex items-center gap-1.5 lowercase text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>zero-fee peer payment</span>
              </div>
            </div>

            {/* Card Inner Body */}
            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
              {/* Tea Glass Emblem */}
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-xs">
                <Coffee className="w-8 h-8" />
              </div>

              {/* Card Title & Pitch */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Support BOOKIE on <span className="font-serif italic text-primary">Buy Me a Chai</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
                A homegrown Indian alternative for scholarly solidarity. Direct, instant via UPI — zero brokerage, zero accounts, pure student-to-server sustenance.
              </p>

              {/* Primary Action Trigger */}
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl shadow-xs hover:bg-primary/90 active:scale-[0.99] transition-all font-sans font-semibold text-sm group"
              >
                <Coffee className="w-4 h-4" />
                <span>Offer a Chai (₹20 / ₹50 / ₹100)</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              {/* Monospace UPI Registry Line & Copy Micro-interaction */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
                <div className="flex items-center gap-2 bg-muted/60 px-3.5 py-1.5 rounded-lg border border-border/80 font-mono text-xs text-foreground">
                  <span className="text-muted-foreground">UPI:</span>
                  <span className="font-semibold">{UPI_HANDLE}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border/80 font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>

              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-6">
                Verified VPA Target • 100% Directed to Infrastructure
              </p>
            </div>

            {/* Card Ledger Bottom Rule */}
            <div className="bg-muted/40 px-6 py-2.5 flex justify-between items-center font-mono text-[11px] text-muted-foreground border-t border-border/80">
              <span>STATUS: OPEN COHORTS</span>
              <span className="text-foreground font-semibold">LAST CHAI: 18m AGO</span>
            </div>
          </div>

          {/* Section Heading: Where Your Support Goes (Stitch Screen 12) */}
          <div className="w-full flex flex-col items-center mb-8">
            <div className="w-12 h-px bg-border/80 mb-4"></div>
            <h3 className="font-serif text-2xl font-bold text-foreground text-center tracking-tight">
              Where your support goes
            </h3>
            <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest mt-1">
              Quarterly Ledger Breakdown & Maintenance Costs
            </p>
          </div>

          {/* 3-Column Architectural Cards (Stitch Screen 12) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Compute & Cache */}
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-muted border border-border/80 flex items-center justify-center text-primary mb-4">
                  <Server className="w-5 h-5" />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Compute & DB Nodes
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground mb-2">
                  Server Costs
                </h4>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  High-speed caching instances, PostgreSQL problem sets, and unthrottled API replicas operating 24/7 during test-taking hours.
                </p>
              </div>
              <div className="mt-6 pt-3.5 bg-muted/40 -mx-6 -mb-6 px-6 py-2.5 rounded-b-2xl border-t border-border/80 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Target Load</span>
                <span className="text-foreground font-semibold">99.98% Uptime</span>
              </div>
            </div>

            {/* Column 2: Test Digitization */}
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-muted border border-border/80 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Archival Ingestion
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground mb-2">
                  Test Scanners
                </h4>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  Optical indexing of premier Kota mock test archives, rigorous diagram vectorization, and step-by-step first-principle derivations.
                </p>
              </div>
              <div className="mt-6 pt-3.5 bg-muted/40 -mx-6 -mb-6 px-6 py-2.5 rounded-b-2xl border-t border-border/80 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Bank Volume</span>
                <span className="text-foreground font-semibold">34,000+ Items</span>
              </div>
            </div>

            {/* Column 3: Unconditional Freedom */}
            <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-muted border border-border/80 flex items-center justify-center text-primary mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Public Good
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground mb-2">
                  Free Forever
                </h4>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  No ₹2.5 Lakh coach paywalls, zero predatory retention algorithms, and no gated solutions. Complete academic transparency without advertisements.
                </p>
              </div>
              <div className="mt-6 pt-3.5 bg-muted/40 -mx-6 -mb-6 px-6 py-2.5 rounded-b-2xl border-t border-border/80 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Tuition Wall</span>
                <span className="text-primary font-semibold">₹0.00 Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Academic Integrity Quote Banner (Stitch Screen 12) */}
          <div className="w-full mt-12 bg-card border border-border/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-foreground">The Academic Non-Commercial Guarantee</div>
                <div className="font-sans text-xs text-muted-foreground mt-0.5">
                  All contributions cover domain renewals, server bills, and LaTeX processing compute. Bookie takes zero private profit.
                </div>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-primary uppercase tracking-wider font-semibold">
              Pure Academic Utility
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}