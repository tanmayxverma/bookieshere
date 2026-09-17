import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "January 15, 2025";

  return (
    <Layout>
      <div className="w-full bg-background blueprint-grid text-foreground min-h-screen py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Navigation / Header */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-primary transition-colors mb-4 px-3 py-1.5 rounded-lg border border-border bg-card/70"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Cockpit</span>
            </Link>

            <div className="rounded-3xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold uppercase tracking-wider mb-3">
                <FileText className="h-4 w-4" /> Legal Agreement
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Terms of Service
              </h1>
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                Last Updated: {lastUpdated} • Effective Immediately
              </p>
              <p className="mt-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Welcome to <strong>BOOKIE</strong> ("we," "our," or "the Platform"). By accessing, registering for, or using our website, study workspace, and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use this service.
              </p>
            </div>
          </div>

          {/* Core Content */}
          <div className="rounded-3xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] space-y-8 text-slate-800 dark:text-slate-200">
            
            {/* 1. Purpose of the Platform */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">1</span>
                Description of Service
              </h2>
              <p className="text-sm leading-relaxed">
                BOOKIE is an educational productivity and study cockpit engineered for competitive examination aspirants (JEE Main, JEE Advanced, NEET UG, and foundation courses). Our platform provides:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                <li>Real-time study timer and tracking (YPT-style tracker and study statistics).</li>
                <li>Curated directory of publicly available educational resources, notes, and formula sheets.</li>
                <li>Interactive countdowns and exam scheduling tools.</li>
                <li>Community discussion forum for peer doubts and academic collaboration.</li>
                <li>Personalized study progress, streaks, and focus sessions.</li>
              </ul>
            </section>

            {/* 2. User Accounts & Google Authentication */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">2</span>
                User Accounts & Google Authentication
              </h2>
              <p className="text-sm leading-relaxed">
                You may access general educational materials as a guest or create a verified account using <strong>Google OAuth</strong> or email. By authenticating through Google, you authorize BOOKIE to access your basic public profile information (name, email address, and profile photo) as permitted by your Google account permissions.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Account Security & Accuracy
                </div>
                <p>
                  You are responsible for maintaining the confidentiality of your credentials and account sessions. You agree to immediately notify us of any unauthorized use or security breaches.
                </p>
              </div>
            </section>

            {/* 3. Acceptable Use Policy */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">3</span>
                Acceptable Use & Code of Conduct
              </h2>
              <p className="text-sm leading-relaxed">
                We maintain a constructive, respectful, and distraction-free learning environment. You expressly agree not to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                <li>Post or transmit abusive, harassing, defamatory, obscene, or hateful content in community discussions.</li>
                <li>Distribute commercial spam, promotional backlinks, or unsolicited advertising.</li>
                <li>Attempt to scrape, reverse engineer, intercept, or disrupt our backend APIs, servers, or database.</li>
                <li>Impersonate any person, mentor, educator, or institutional administrator.</li>
                <li>Engage in deliberate academic dishonesty, malicious link distribution, or security circumvention.</li>
              </ul>
              <p className="text-sm leading-relaxed">
                Violation of these conduct rules may lead to immediate account suspension, community muting, or permanent ban without prior notice.
              </p>
            </section>

            {/* 4. Educational & Intellectual Property Disclaimer */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">4</span>
                Intellectual Property & Fair-Use Disclaimer
              </h2>
              <p className="text-sm leading-relaxed">
                BOOKIE acts strictly as an educational platform and indexer of publicly available reference links on third-party platforms.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                <li>We do not scan, produce, or host unauthorized copyrighted publications on our own storage servers.</li>
                <li>All institute logos, trademarks, and book titles remain the exclusive intellectual property of their respective owners and publishers.</li>
                <li>Any third-party educational materials referenced on this site are shared solely under the fair-use doctrine for non-commercial educational study and research.</li>
                <li>We encourage all aspirants to purchase original publications and enrolled coaching packages directly from official publishers.</li>
              </ul>
              <p className="text-sm leading-relaxed">
                If you are a copyright owner wishing to request removal of an indexed reference, visit our <Link to="/dmca" className="text-primary underline font-bold">DMCA Notice page</Link> or email us directly at <a href="mailto:capcutwaladiddy@gmail.com" className="text-primary underline font-bold">capcutwaladiddy@gmail.com</a>. Notice requests are executed within 24–48 hours.
              </p>
            </section>

            {/* 5. Limitation of Liability */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">5</span>
                Warranty Disclaimer & Limitation of Liability
              </h2>
              <p className="text-sm leading-relaxed">
                The platform, study tools, materials, and timers are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied. While we endeavor to provide uninterrupted uptime and accurate formulas, BOOKIE does not guarantee that the service will be error-free or that specific competitive exam outcomes will be achieved.
              </p>
              <p className="text-sm leading-relaxed">
                In no event shall BOOKIE or its developers be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
              </p>
            </section>

            {/* 6. Modification & Termination */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">6</span>
                Termination & Service Modifications
              </h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any feature of BOOKIE at any time. We also reserve the right to terminate or suspend user accounts that violate these Terms. Users may discontinue their use and delete their account at any time.
              </p>
            </section>

            {/* 7. Contact & Legal Enquiries */}
            <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">7</span>
                Legal Enquiries & Official Contact
              </h2>
              <p className="text-sm leading-relaxed">
                For questions regarding these Terms of Service, user rights, or legal inquiries, please contact our team via the options below:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800/80 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1.5">
                    <MessageSquare className="h-4 w-4" /> Support Chat Option
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Submit a real-time support ticket or enquiry directly inside the app.
                  </p>
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-900 hover:bg-primary/10 transition-colors"
                  >
                    <span>Open Support Desk</span> ↗
                  </Link>
                </div>

                <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800/80 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1.5">
                    <Mail className="h-4 w-4" /> Official Email Enquiry
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    For legal notices, compliance, and Google Cloud verification enquiries:
                  </p>
                  <a
                    href="mailto:capcutwaladiddy@gmail.com"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-900 hover:bg-primary/10 transition-colors"
                  >
                    <span>capcutwaladiddy@gmail.com</span> ↗
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
