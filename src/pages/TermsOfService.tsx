import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export default function TermsOfService() {
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
              <FileText className="h-3.5 w-3.5 text-primary" /> Legal Terms
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground font-mono">
              Last Updated: {lastUpdated} • Effective Immediately
            </p>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
              Welcome to <strong>BOOKIE</strong> ("we," "our," or "the Platform"). By accessing, registering for, or using our website, study workspace, and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use this service.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-[4px_4px_0px_var(--desk-border)] space-y-8 text-foreground/90 font-sans text-xs sm:text-sm">
            {/* 1. Purpose */}
            <section className="space-y-2.5">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">1</span>
                Description of Service
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                BOOKIE is an educational productivity cockpit engineered for competitive examination aspirants (JEE Main, JEE Advanced, NEET UG, and foundation courses). Our platform provides:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                <li>Real-time study timer and focus tracking (YPT-style carrel and study stats).</li>
                <li>Curated directory of publicly available educational resources, notes, and formula sheets.</li>
                <li>Interactive countdowns and exam scheduling tools.</li>
                <li>Community discussion forum for peer doubts and academic collaboration.</li>
                <li>Personalized study progress, streaks, and focus sessions.</li>
              </ul>
            </section>

            {/* 2. User Accounts */}
            <section className="space-y-2.5">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">2</span>
                User Accounts & Authentication
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                You may access general educational materials as a guest or create a verified account using <strong>Google OAuth</strong> or email. By authenticating through Google, you authorize BOOKIE to access your basic public profile information (name, email address, and profile photo) as permitted by your Google account permissions.
              </p>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs font-mono space-y-1">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Account Security
                </div>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your session and account details.
                </p>
              </div>
            </section>

            {/* 3. Acceptable Use */}
            <section className="space-y-2.5">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">3</span>
                Acceptable Use & Code of Conduct
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We maintain a constructive, respectful, and distraction-free learning environment. You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                <li>Post abusive, harassing, or defamatory content in community discussions.</li>
                <li>Distribute commercial spam, paid leaks, or malicious links.</li>
                <li>Attempt to reverse engineer, disrupt, or exploit our backend APIs or database.</li>
                <li>Impersonate any mentor, educator, or institutional administrator.</li>
              </ul>
            </section>

            {/* 4. Educational Disclaimer */}
            <section className="space-y-2.5">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">4</span>
                Intellectual Property & Fair-Use Disclaimer
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                BOOKIE acts strictly as an educational platform and indexer of publicly available reference links on third-party platforms. All institute logos, trademarks, and book titles remain the exclusive intellectual property of their respective owners.
              </p>
            </section>

            {/* 5. Contact */}
            <section className="space-y-3 pt-4 border-t border-border">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                <span className="w-5 h-5 rounded border border-border bg-muted text-foreground text-[11px] flex items-center justify-center font-mono">5</span>
                Legal Enquiries & Official Contact
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl border-2 border-border bg-muted/40 shadow-[2px_2px_0px_var(--desk-border)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                    <MessageSquare className="h-3.5 w-3.5" /> Support Chat
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Submit a real-time support ticket or enquiry directly in the app.
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
                    For legal notices and compliance inquiries:
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
