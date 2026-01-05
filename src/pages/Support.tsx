import { MessageCircle, ExternalLink, Send, AlertCircle, FileWarning, Link2Off, HelpCircle } from "lucide-react";
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
  const telegramChannelLink = "https://t.me/bookieshere";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Chat <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Support</span>
            </h1>

            <p className="text-muted-foreground">
              Need help with downloads or encountering issues? We're here to assist you.
            </p>
          </div>

          {/* Uses of Chat Support */}
          <div className="bg-muted/30 rounded-xl border border-border p-6 mb-8">
            <h2 className="font-display font-semibold text-foreground mb-4">
              What can we help with?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {supportUses.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-card flex items-center justify-center text-primary border border-border">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                    <p className="text-muted-foreground text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="gap-2 w-full"
              onClick={() => window.open(telegramBotLink, "_blank", "noopener,noreferrer")}
            >
              <MessageCircle className="h-5 w-5" />
              Chat Support
              <ExternalLink className="h-4 w-4" />
            </Button>

            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                All support is handled via Telegram for faster response.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Support;