import { AlertTriangle, Info, Youtube, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const steps = [
  {
    number: 1,
    title: "Click on the Download Button",
    description: 'Find the material you want and click the "Download" button on the material card.',
  },
  {
    number: 2,
    title: "Shortened Link Page Opens",
    description: "A new tab will open with a shortened link page. This is normal and helps support the platform.",
  },
  {
    number: 3,
    title: "Complete the Required Step",
    description: "Wait for the timer to complete or click the skip/continue button when it appears.",
  },
  {
    number: 4,
    title: 'Click "Continue" or "Get Link"',
    description: "After completing the previous step, click on the continue or get link button to proceed.",
  },
  {
    number: 5,
    title: "Access Your Material",
    description: "You will be redirected to the final page where you can view or download your study material.",
  },
];

const HowToDownload = () => {
  const youtubeVideoLink = "https://youtu.be/p7le2sPhPBg?si=eo6VQAMcIfkatRc9";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            How to Download Materials from BOOKIE
          </h1>
          <p className="text-muted-foreground">
            Follow these simple steps to download your study materials.
          </p>
        </div>

        {/* Video Tutorial Section */}
        <div className="mb-8 p-6 bg-card rounded-xl border border-border">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <Youtube className="h-6 w-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display font-semibold text-foreground mb-1">
                Prefer a Video Tutorial?
              </h2>
              <p className="text-sm text-muted-foreground">
                Watch our step-by-step video guide if you need visual instructions.
              </p>
            </div>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => window.open(youtubeVideoLink, "_blank", "noopener,noreferrer")}
            >
              <Youtube className="h-4 w-4" />
              Watch Video
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 p-5 bg-card rounded-xl border border-border"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold flex items-center justify-center">
                {step.number}
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Why Shortened Links */}
        <Alert className="border-muted bg-muted/30 mb-6">
          <Info className="h-4 w-4 text-muted-foreground" />
          <AlertTitle className="text-foreground">Why shortened links?</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Links are shortened to support website and server costs. This is a free, student-run platform.
          </AlertDescription>
        </Alert>

        {/* Important Notes */}
        <div className="space-y-4">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Do not use ad blockers while opening links. They may prevent the download page from loading correctly.
            </AlertDescription>
          </Alert>

          <Alert className="border-primary/50 bg-primary/10">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              If a link doesn't open or gets stuck, try refreshing the page and clicking the download button again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Layout>
  );
};

export default HowToDownload;
