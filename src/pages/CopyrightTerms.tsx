import { Layout } from "@/components/Layout";

const CopyrightTerms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-[900px] mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Copyright Disclaimer & Terms of Service
          </h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: December 29, 2025
          </p>

          <div className="space-y-6 text-foreground/90">
            <p>
              This website (BOOKIE) is an educational resource aggregator. We do not claim ownership, authorship, scanning, or hosting of any study material available through this platform.
            </p>

            <p>
              All resources are provided as links to content that is already publicly accessible on third-party platforms.
            </p>

            <p>
              Materials are shared strictly for educational and informational purposes under fair-use principles.
            </p>

            <p>
              We do not promote, support, or encourage piracy in any form. Users are strongly encouraged to purchase original materials from official publishers and authors.
            </p>

            <p>
              This website does NOT host any files on its own servers. All content is accessed via third-party platforms.
            </p>

            <p>
              If you are a copyright owner or authorized representative and believe that any content violates your rights, please contact us. The content will be removed within 24–48 hours.
            </p>

            <div className="mt-8 p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">Contact for concerns:</p>
              <p>
                Chat Support:{" "}
                <a href="/support" className="text-primary hover:underline">Open a support ticket</a>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:capcutwaladiddy@gmail.com" className="text-primary hover:underline">capcutwaladiddy@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CopyrightTerms;
