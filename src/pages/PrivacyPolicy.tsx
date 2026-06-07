import { Layout } from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-[900px] mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>

          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: December 29, 2025
          </p>

          <div className="space-y-6 text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Data Collection</h2>
              <p>
                BOOKIE does not collect, store, or sell any personal data from users. We do not require account creation or login to access resources.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Analytics</h2>
              <p>
                We may use minimal, privacy-respecting analytics to understand general usage patterns. No personally identifiable information is collected or stored.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
              <p>
                Cookies are used only for essential functionality such as theme preferences (light/dark mode). We do not use tracking cookies or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Links</h2>
              <p>
                This website may contain links to external platforms (such as study material hosts). We are not responsible for the privacy practices or content of these third-party sites. Users are encouraged to review the privacy policies of any external platforms they visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
              <p>
                For any privacy-related concerns, please contact us via:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <p>
                  Chat Support:{" "}
                  <a href="/support" className="text-primary hover:underline">Open a support ticket</a>
                </p>
                <p>
                  Email:{" "}
                  <a href="mailto:capcutwaladiddy@gmail.com" className="text-primary hover:underline">capcutwaladiddy@gmail.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
