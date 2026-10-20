import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Lock, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "January 15, 2025";

  return (
    <Layout>
      <div className="w-full bg-academic-grid text-foreground min-h-screen py-10 px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-2 px-3.5 py-1.5 rounded-xl border border-border/80 bg-card shadow-xs group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary font-mono text-[10px] font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Privacy & Security Commitment
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground font-mono">
              Last Updated: {lastUpdated} • Effective Immediately
            </p>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
              At <strong className="text-foreground">BOOKIE</strong> ("we," "our," or "the Platform"), we respect your personal privacy and are committed to safeguarding your information. This Privacy Policy details the types of information we access and collect, how we protect it, and your rights regarding data access and permanent deletion.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-8 text-foreground/90 font-sans text-xs sm:text-sm">
            {/* 1. Information */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded-lg border border-border/80 bg-muted/60 text-foreground text-[11px] flex items-center justify-center font-mono">1</span>
                Information We Access & Collect
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                BOOKIE collects and accesses only the minimum information necessary to operate our study cockpit:
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-xs text-primary flex items-center gap-2 font-mono">
                    <Lock className="h-3.5 w-3.5" /> A. Authentication Data
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When you authenticate using Google or email, we receive basic profile info (email and display name) solely for authentication and session management.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
                  <div className="font-semibold text-xs text-foreground font-mono">
                    B. Study Workspace Data You Voluntarily Provide
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Study session lengths, daily focus records, target exam year, and public community doubts you choose to post.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Zero Monetization */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded-lg border border-border/80 bg-muted/60 text-foreground text-[11px] flex items-center justify-center font-mono">2</span>
                Zero Commercial Monetization Policy
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We operate under an unconditional non-monetization guarantee. We do not sell, rent, or trade your personal data, study logs, or email address with any third-party advertisers, coaching institutes, or marketing agencies.
              </p>
            </section>

            {/* 3. Data Deletion */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded-lg border border-border/80 bg-muted/60 text-foreground text-[11px] flex items-center justify-center font-mono">3</span>
                Your Right to Permanent Data Deletion
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                You possess full ownership of your data. You may permanently delete your account, session logs, streaks, and community posts at any time via your <Link to="/profile" className="text-primary hover:underline font-semibold">Profile Settings</Link>.
              </p>
            </section>

            {/* 4. Contact */}
            <section className="pt-2 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Privacy Enquiries:</span>
              <Link to="/support" className="text-primary hover:underline font-semibold">
                Direct Architect Line →
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
