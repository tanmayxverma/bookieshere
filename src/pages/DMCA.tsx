import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function DMCA() {
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
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> COPYRIGHT POLICY
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                DMCA Copyright Notice Protocol
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Notice &amp; Takedown Procedure • Academic Transparency
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed border-t border-border/80 pt-4">
              <p>
                <strong className="text-foreground">BOOKIE</strong> respects the intellectual property rights of copyright holders and expects all users and aspirants to do the same.
              </p>

              <p>
                In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to valid copyright infringement notices and takedown requests.
              </p>

              <p>
                If you believe content linked or referenced on this website infringes upon your copyrighted work, please provide our designated representative with:
              </p>

              <ol className="list-decimal list-inside space-y-2 ml-2 font-mono text-xs bg-muted/40 p-4 rounded-xl border border-border/80 text-foreground">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The exact URL(s) or reference locations on BOOKIE.</li>
                <li>Proof of copyright ownership or legal authorization from the rights holder.</li>
                <li>A statement of good faith belief that the disputed use is unauthorized.</li>
                <li>A statement made under penalty of perjury that the information provided is accurate.</li>
                <li>Your official contact information (legal name, physical address, phone number, email).</li>
              </ol>

              <div className="mt-6 p-4 rounded-xl border border-border/80 bg-muted/40 space-y-2">
                <p className="font-mono text-xs font-semibold uppercase text-foreground">Official Takedown Inquiries:</p>
                <p className="font-sans text-xs">
                  Direct Support Line:{" "}
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
