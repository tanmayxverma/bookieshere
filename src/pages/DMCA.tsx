import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const DMCA = () => {
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

          <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-[4px_4px_0px_var(--desk-border)] space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> COPYRIGHT POLICY
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                DMCA Copyright Notice Protocol
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Notice &amp; Takedown Procedure
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-sans text-foreground/90 leading-relaxed border-t border-border pt-4">
              <p>
                BOOKIE respects the intellectual property rights of copyright holders and expects all users to do the same.
              </p>

              <p>
                In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to valid copyright infringement notices and takedown requests.
              </p>

              <p>
                If you believe content linked or referenced on this website infringes upon your copyrighted work, please provide our agent with:
              </p>

              <ol className="list-decimal list-inside space-y-2 ml-2 font-mono text-xs bg-muted/30 p-4 rounded-xl border border-border">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The exact URL(s) or reference locations on BOOKIE.</li>
                <li>Proof of copyright ownership or legal authorization from the rights holder.</li>
                <li>A statement of good faith belief that the disputed use is unauthorized.</li>
                <li>A statement made under penalty of perjury that the information provided is accurate.</li>
                <li>Your official contact information (legal name, physical address, phone number, email).</li>
              </ol>

              <div className="mt-6 p-4 rounded-xl border-2 border-border bg-muted/40 space-y-2">
                <p className="font-mono text-xs font-bold uppercase text-foreground">Official Takedown Inquiries:</p>
                <p className="font-sans text-xs">
                  Chat Support:{" "}
                  <Link to="/support" className="text-primary underline font-medium">
                    Open a maintainer support ticket
                  </Link>
                </p>
                <p className="font-sans text-xs">
                  Email:{" "}
                  <a href="mailto:capcutwaladiddy@gmail.com" className="text-primary underline font-medium">
                    capcutwaladiddy@gmail.com
                  </a>
                </p>
              </div>

              <p className="text-xs text-muted-foreground font-mono">
                Upon receiving a verified notice, we will remove or disable access to the specified link within 24–48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DMCA;
