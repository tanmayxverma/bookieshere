import { MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const Support = () => {
  // Replace this with your actual Telegram link
  const telegramLink = "https://t.me/your_telegram_bot";

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

          <Button
            size="lg"
            className="gap-2"
            onClick={() => window.open(telegramLink, "_blank", "noopener,noreferrer")}
          >
            <MessageCircle className="h-5 w-5" />
            Chat on Telegram
            <ExternalLink className="h-4 w-4" />
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            All support is handled via Telegram for faster response.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Support;