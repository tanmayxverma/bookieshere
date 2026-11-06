import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, MessageSquare, ArrowLeft, Lock, Trash2, EyeOff, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "November 6, 2026";

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
                <ShieldCheck className="h-4 w-4" /> Privacy & Security Commitment
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                Last Updated: {lastUpdated} • Effective Immediately
              </p>
              <p className="mt-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                At <strong>BOOKIE</strong> ("we," "our," or "the Platform"), operated at <strong>bookiejee.cv</strong>, a free study platform for JEE aspirants, we respect your personal privacy and are committed to safeguarding your information. This Privacy Policy details the types of information we access and collect, how we use and protect it, our adherence to Google API Services User Data Policies, and your rights regarding data access and deletion.
              </p>
            </div>
          </div>

          {/* Core Content */}
          <div className="rounded-3xl border-2 border-slate-900 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] space-y-8 text-slate-800 dark:text-slate-200">
            
            {/* 1. Information We Access & Collect */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">1</span>
                Information We Access & Collect
              </h2>
              <p className="text-sm leading-relaxed">
                BOOKIE only collects and accesses the minimum information necessary to operate our study cockpit:
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-sm text-primary flex items-center gap-2">
                    <Lock className="h-4 w-4" /> A. Google OAuth User Data (When You Sign in with Google)
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    When you choose to authenticate using <strong>Google OAuth</strong>, we request access only to your basic public Google account profile:
                  </p>
                  <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 pl-2 text-slate-600 dark:text-slate-400">
                    <li><strong>Google Email Address</strong>: Used solely for account identification and authentication.</li>
                    <li><strong>Google Display Name</strong>: Used to personalize your study workspace and show your name in peer discussions.</li>
                    <li><strong>Google Profile Picture URL (Avatar)</strong>: Used to automatically set your default profile picture on the site, which you can customize or remove at any time.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    B. Study Workspace Data You Voluntarily Provide
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    During onboarding or regular use, you may submit:
                  </p>
                  <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 pl-2 text-slate-600 dark:text-slate-400">
                    <li>Target exam category (e.g. JEE 2027, Droppers).</li>
                    <li>Study timer records, subject focus hours, and task completions.</li>
                    <li>Questions, comments, and academic doubts voluntarily submitted to the community board.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    C. Guest Device Identifier & Local Preferences
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    For guest users who choose not to sign in, a random anonymous client UUID is generated in your browser's local storage to preserve study timer sessions and interface themes (light/dark/lite mode). No personally identifiable information is collected from guest sessions.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. How We Use Information */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">2</span>
                How We Use Your Information
              </h2>
              <p className="text-sm leading-relaxed">
                We use information strictly to deliver and maintain the educational functionality of BOOKIE:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                <li>Authenticating and securing your user session.</li>
                <li>Displaying your preferred name and profile photo in the User Menu and community posts.</li>
                <li>Preserving your study progress, study streaks, and daily time tracker statistics across devices.</li>
                <li>Providing customer support and responding to academic and platform queries.</li>
              </ul>
            </section>

            {/* 3. Google API Services User Data Policy / Limited Use Disclosure */}
            <section className="space-y-4 p-5 rounded-2xl border-2 border-primary/40 bg-primary/5 dark:bg-primary/10">
              <h2 className="font-display text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Google API Services User Data Policy Compliance (Limited Use Disclosure)
              </h2>
              <p className="text-sm leading-relaxed font-medium">
                BOOKIE's use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-primary hover:opacity-80"
                >
                  Google API Services User Data Policy
                </a>
                , including the <strong>Limited Use</strong> requirements.
              </p>
              <div className="text-xs sm:text-sm space-y-2 text-slate-700 dark:text-slate-300">
                <p>Specifically:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>We only request access to scopes essential for authentication (<code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">openid</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">email</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">profile</code>).</li>
                  <li>We do <strong>NOT</strong> transfer or disclose your Google user data to third parties, except as strictly necessary to provide the platform's core study functionality or comply with applicable laws.</li>
                  <li>We do <strong>NOT</strong> use or transfer Google user data for serving personalized, targeted, or interest-based advertisements.</li>
                  <li>We do <strong>NOT</strong> permit humans to read your Google user data, nor do we use it to train artificial intelligence or machine learning models.</li>
                </ul>
              </div>
            </section>

            {/* 4. Data Sharing & Third Parties */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">4</span>
                Zero Sale of Personal Data
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <EyeOff className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>We do not sell, rent, monetize, or trade your personal data or Google user data to any third party, broker, or advertising network under any circumstances.</strong>
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Data is stored securely on cloud database infrastructure provided by Supabase (PostgreSQL), protected by end-to-end TLS encryption in transit and AES-256 encryption at rest with strict Row-Level Security (RLS) enforcement.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                To operate the Platform we rely on the following service providers, who process data only on our behalf and only to provide their service:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                <li><strong>Supabase</strong>: authentication and database hosting (stores your account profile and study data).</li>
                <li><strong>Vercel</strong>: website hosting and delivery (may process standard technical request logs such as IP address and browser type).</li>
                <li><strong>Google</strong>: sign-in with Google (OAuth). We receive only the basic profile fields listed in Section 1.</li>
                <li><strong>OpenRouter</strong>: AI model routing for the optional Bookie AI chat. Only the messages and images you choose to send to Bookie AI are transmitted, and they are used solely to generate a reply. Google account data is never sent to the AI provider. Please do not enter sensitive personal information in the chat.</li>
              </ul>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Except for these providers, and where required by law, we do not share your information with anyone.
              </p>
            </section>

            {/* 5. User Rights, Data Retention & Deletion */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">5</span>
                Data Retention & User Deletion Rights
              </h2>
              <p className="text-sm leading-relaxed">
                You maintain complete control over your information:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 text-slate-700 dark:text-slate-300">
                <li><strong>Profile Customization</strong>: You can update your display name, target batch, or change/remove your avatar photo anytime on the <Link to="/profile" className="text-primary underline font-bold">Profile Page</Link>.</li>
                <li><strong>Account & Data Deletion</strong>: You have the right to request the permanent deletion of your account, study history, community records, and any associated Google user data.</li>
                <li><strong>Retention</strong>: We keep your account and study data for as long as your account is active. When you request deletion, your profile, study history, community records and any stored Google profile data are permanently erased from our database, and backups are purged on the provider's normal rotation cycle. Guest data stays only in your own browser and can be cleared at any time by clearing site data.</li>
                <li><strong>Deletion Fulfillment</strong>: To request complete data erasure, simply submit a request through in-app <Link to="/support" className="text-primary underline font-bold">Support Chat</Link> or send an email to <a href="mailto:capcutwaladiddy@gmail.com" className="text-primary underline font-bold">capcutwaladiddy@gmail.com</a>. Deletion requests are processed and confirmed within <strong>24 to 48 hours</strong>.</li>
              </ul>
            </section>

            {/* 6. Cookies and Local Storage */}
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">6</span>
                Cookies & Local Browser Storage
              </h2>
              <p className="text-sm leading-relaxed">
                BOOKIE uses browser LocalStorage strictly for functional and performance purposes:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 pl-2 text-slate-700 dark:text-slate-300">
                <li>Authentication session tokens (<code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">sb-access-token</code>).</li>
                <li>Theme preferences (light, dark, system).</li>
                <li>Lite Mode toggle state for low-bandwidth devices.</li>
                <li>Local active timer states to prevent timer resets upon page reload.</li>
              </ul>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                We do not employ third-party tracking pixels, cross-site trackers, or advertising cookies.
              </p>
            </section>

            {/* 7. Contact & Privacy Inquiries */}
            <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs flex items-center justify-center font-mono">7</span>
                Contact Us & Privacy Enquiries
              </h2>
              <p className="text-sm leading-relaxed">
                If you have questions, data deletion requests, or need clarification regarding our privacy practices and Google OAuth verification, please reach out through our official channels:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-800/80 shadow-[2px_2px_0px_0px_rgba(19,27,46,1)]">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1.5">
                    <MessageSquare className="h-4 w-4" /> In-App Support Chat
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Submit a real-time support enquiry or ticket directly inside the portal.
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
                    For privacy questions, data deletion requests, and Google Cloud compliance:
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
