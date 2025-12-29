import { AlertTriangle, Info, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Layout } from "@/components/Layout";

const steps = [
  {
    number: 1,
    title: "Click on the Download Button",
    description: 'Find the material you want and click the "Download / Open Link" button on the material card.',
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