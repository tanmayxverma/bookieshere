import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, MessageSquare, ArrowLeft, Lock, EyeOff, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "January 15, 2025";

  return (
    <Layout>
      <div className="w-full bg-background text-foreground min-h-screen py-10 px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-colors mb-2 px-3 py-1.5 rounded-lg border border-border bg-card shadow-[1px_1px_0px_var(--desk-border)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-[4px_4px_0px_var(--desk-border)]">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded border border-border bg-muted text-foreground font-mono text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Privacy & Security Commitment
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground font-mono">
              Last Updated: {lastUpdated} • Effective Immediately
            </p>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
              At <strong>BOOKIE</strong> ("we," "our," or "the Platform"), we respect your personal privacy and are committed to safeguarding your information. This Privacy Policy details the types of information we access and collect, how we protect it, and your rights regarding data access and permanent deletion.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-[4px_4px_0px_var(--desk-border)] space-y-8 text-foreground/90 font-sans text-xs sm:text-sm">
            {/* 1. Information */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">1</span>
                Information We Access & Collect
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                BOOKIE collects and accesses only the minimum information necessary to operate our study cockpit:
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="font-bold text-xs text-primary flex items-center gap-2 font-mono">
                    <Lock className="h-3.5 w-3.5" /> A. Authentication Data
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When you authenticate using Google or email, we receive basic profile info (email and display name) solely for authentication and session management.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="font-bold text-xs text-foreground font-mono">
                    B. Study Workspace Data You Voluntarily Provide
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Study timer records, subject focus hours, task completions, and academic doubt discussions voluntarily submitted to the community ledger.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="font-bold text-xs text-foreground font-mono">
                    C. Guest Device Identifier & Local Preferences
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    For guest users, a random anonymous client UUID is generated in local storage to preserve study sessions without collecting personal data.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Zero Sale */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">2</span>
                Zero Sale of Personal Data
              </h2>
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-foreground flex items-start gap-3">
                <EyeOff className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs font-sans leading-relaxed">
                  <strong>We do not sell, rent, monetize, or trade your personal data or study activity to any third party, broker, or advertising network under any circumstances.</strong>
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Data is stored securely on Supabase cloud database infrastructure with end-to-end TLS encryption in transit, AES-256 at rest, and PostgreSQL Row-Level Security (RLS) enforcement.
              </p>
            </section>

            {/* 3. Deletion Rights */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">3</span>
                Data Retention & User Deletion Rights
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                You maintain complete ownership of your data:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                <li><strong>Profile Customization</strong>: You can change or remove your profile details anytime on the <Link to="/profile" className="text-primary underline">Profile Page</Link>.</li>
                <li><strong>Instant Self-Service Deletion</strong>: You can permanently erase all study history, streaks, and account data instantly in the Danger Zone on your Profile page.</li>
                <li><strong>Support Deletion Request</strong>: You can also request complete data purge via <Link to="/support" className="text-primary underline">Support Chat</Link> or email.</li>
              </ul>
            </section>

            {/* 4. Contact */}
            <section className="space-y-3 pt-4 border-t border-border">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">4</span>
                Privacy Inquiries & Official Contact
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl border-2 border-border bg-muted/40 shadow-[2px_2px_0px_var(--desk-border)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                    <MessageSquare className="h-3.5 w-3.5" /> Support Chat
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Submit a support ticket or privacy inquiry directly inside the app.
                  </p>
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-foreground hover:underline"
                  >
                    Open Support Desk →
                  </Link>
                </div>

                <div className="p-4 rounded-xl border-2 border-border bg-muted/40 shadow-[2px_2px_0px_var(--desk-border)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                    <Mail className="h-3.5 w-3.5" /> Direct Email
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    For privacy questions and data deletion confirmations:
                  </p>
                  <a
                    href="mailto:capcutwaladiddy@gmail.com"
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-foreground hover:underline"
                  >
                    capcutwaladiddy@gmail.com →
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
