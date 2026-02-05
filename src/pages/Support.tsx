import { Link } from "react-router-dom";
import { MessageCircle, ExternalLink, Send, AlertCircle, FileWarning, Link2Off, HelpCircle, Headphones, BookOpen, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const supportUses = [
  {
    icon: Link2Off,
    title: "Report Broken Links",
    description: "If a download link isn't working or redirects incorrectly, let us know.",
  },
  {
    icon: FileWarning,
    title: "File Opening Issues",
    description: "Having trouble opening or viewing a downloaded file? We can help.",
  },
  {
    icon: AlertCircle,
    title: "Download Problems",
    description: "If the download process isn't working as expected, report it here.",
  },
  {
    icon: HelpCircle,
    title: "Technical Assistance",
    description: "Any other technical issues with accessing materials.",
  },
];

const Support = () => {
  const telegramBotLink = "https://t.me/tellurdemandsbot";

  return (
    <Layout>
      <div className="min-h-[80vh] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header - Perfectly aligned on single vertical axis */}
            <div className="flex flex-col items-center text-center mb-14 opacity-0 animate-fade-in">
              {/* Icon with subtle static glow - centered */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5">
                <Headphones className="h-8 w-8" />
                <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
              </div>

              {/* Pill - centered below icon */}
              <span className="pill pill-primary mb-5 shadow-sm shadow-primary/10">
                <MessageCircle className="h-3 w-3" />
                Quick Response
              </span>

              {/* Heading - centered with gradient emphasis */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Chat{" "}
                <span className="text-gradient-glow">Support</span>
              </h1>

              {/* Description with visual anchors */}
              <p className="text-muted-foreground max-w-md mx-auto text-base flex items-center justify-center gap-2">
                <span className="w-6 h-px bg-border/60" />
                Need help with downloads or encountering issues? We're here to assist.
                <span className="w-6 h-px bg-border/60" />
              </p>
            </div>

            {/* Quick Actions - Browse Materials & Practice Tests */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6 opacity-0 animate-fade-in stagger-1">
              <Link
                to="/materials"
                className="group flex items-center gap-4 p-5 bg-surface-1 rounded-xl border border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-1">Browse Materials</h3>
                  <p className="text-sm text-muted-foreground">Access study resources</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/tests"
                className="group flex items-center gap-4 p-5 bg-surface-1 rounded-xl border border-border/40 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground mb-1">Practice Tests</h3>
                  <p className="text-sm text-muted-foreground">Take JEE mock tests</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Divider */}
            <div className="pinch-bar opacity-0 animate-fade-in stagger-2">
              <span className="pinch-bar-line" />
            </div>

            {/* Support Uses Card - Surface Level 1 */}
            <div className="bg-surface-1 rounded-2xl border border-border/40 p-6 md:p-8 mb-6 opacity-0 animate-fade-in stagger-3">
              <h2 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary" />
                What can we help with?
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {supportUses.map((item, index) => (
                  <div 
                    key={item.title} 
                    className="flex gap-4 p-4 bg-surface-2 rounded-xl border border-border/30 transition-all duration-200 hover:border-primary/20 hover:-translate-y-0.5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section - Surface Level 2 */}
            <div className="bg-surface-2 rounded-2xl border border-border/40 p-6 md:p-8 text-center opacity-0 animate-fade-in stagger-4">
              <h3 className="font-display font-semibold text-foreground mb-3 text-lg">
                Ready to get help?
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                All support is handled via Telegram for faster response times.
              </p>
              
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)] hover:opacity-90 shadow-lg shadow-primary/25 btn-press transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => window.open(telegramBotLink, "_blank", "noopener,noreferrer")}
              >
                <Send className="h-5 w-5" />
                Chat Support
                <ExternalLink className="h-4 w-4" />
              </Button>

              {/* Bottom enrichment */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-xs text-muted-foreground/70">
                  Typical response time: within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
