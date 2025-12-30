import { MessageCircle, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const Support = () => {
  const telegramBotLink = "https://t.me/tellurdemandsbot";
  const telegramChannelLink = "https://t.me/bookieshere";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <MessageCircle className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Need Help?
          </h1>

          <p className="text-muted-foreground mb-8">
            Facing issues with downloads or can't find a material you need? 
            We're here to help! Reach out to us on Telegram for quick assistance.
          </p>

          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              className="gap-2 w-full"
              onClick={() => window.open(telegramBotLink, "_blank", "noopener,noreferrer")}
            >
              <MessageCircle className="h-5 w-5" />
              Report Problem / Chat Support
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full"
              onClick={() => window.open(telegramChannelLink, "_blank", "noopener,noreferrer")}
            >
              <Send className="h-5 w-5" />
              BOOKIE Official Telegram
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            All support is handled via Telegram for faster response.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
