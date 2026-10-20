import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function CopyrightTerms() {
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

          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary font-mono text-[10px] font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> LEGAL NOTICE
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Copyright Disclaimer & Terms
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Effective Date: December 29, 2025 • Educational Fair-Use Policy
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed border-t border-border/80 pt-4">
              <p>
                This website (<strong className="text-foreground">BOOKIE</strong>) is an educational resource aggregator. We do not claim ownership, authorship, scanning, or hosting of any study material accessible through this platform.
              </p>

              <p>
                All resources are provided as direct links to content that is already publicly accessible across third-party educational networks.
              </p>

              <p>
                Materials are referenced strictly for educational and informational purposes under fair-use principles to assist serious JEE and NEET aspirants.
              </p>

              <p>
                We do not promote, support, or encourage piracy in any form. Users are strongly encouraged to purchase original materials and test series directly from official coaching institutes and book publishers.
              </p>

              <p>
                This website does NOT host any file binaries on its own servers. All content links are external references.
              </p>

              <p>
                If you are a copyright owner or authorized representative and believe that any referenced link violates your rights, please contact us. The reference will be removed within 24–48 hours upon verification.
              </p>

              <div className="mt-6 p-4 rounded-xl border border-border/80 bg-muted/40 space-y-2">
                <p className="font-mono text-xs font-semibold uppercase text-foreground">Contact for Intellectual Property Concerns:</p>
                <p className="font-sans text-xs">
                  Direct Desk:{" "}
                  <Link to="/support" className="text-primary underline font-semibold">
                    Open a maintainer support ticket
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
