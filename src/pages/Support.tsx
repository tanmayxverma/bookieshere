import { MessageCircle, ExternalLink, Send, AlertCircle, FileWarning, Link2Off, HelpCircle, Headphones } from "lucide-react";
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
      <div className="min-h-[80vh] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 opacity-0 animate-fade-in">
              {/* Icon with subtle glow */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5">
                <Headphones className="h-8 w-8" />
                <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
              </div>

              <span className="pill pill-primary mb-4">
                <MessageCircle className="h-3 w-3" />
                Quick Response
              </span>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Chat <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Support</span>
              </h1>

              <p className="text-muted-foreground max-w-md mx-auto">
                Need help with downloads or encountering issues? We're here to assist you.
              </p>
            </div>

            {/* Divider */}
            <div className="pinch-bar opacity-0 animate-fade-in stagger-1">
              <span className="pinch-bar-line" />
            </div>

            {/* Support Uses Card - Surface Level 1 */}
            <div className="bg-surface-1 rounded-2xl border border-border/40 p-6 md:p-8 mb-8 opacity-0 animate-fade-in stagger-2">
              <h2 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary" />
                What can we help with?
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {supportUses.map((item, index) => (
                  <div 
                    key={item.title} 
                    className="flex gap-4 p-4 bg-surface-2 rounded-xl border border-border/30 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
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
            <div className="bg-surface-2 rounded-2xl border border-border/40 p-6 md:p-8 text-center opacity-0 animate-fade-in stagger-3">
              <h3 className="font-display font-semibold text-foreground mb-3">
                Ready to get help?
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                All support is handled via Telegram for faster response times.
              </p>
              
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-[#0088cc] to-[#0066aa] hover:from-[#0088cc]/90 hover:to-[#0066aa]/90 shadow-lg shadow-[#0088cc]/25"
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
