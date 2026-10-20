import { Layout } from "@/components/Layout";

const DMCA = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-[900px] mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            DMCA Copyright Policy
          </h1>

          <div className="space-y-6 text-foreground/90">
            <p>
              BOOKIE respects the intellectual property rights of others and expects users to do the same.
            </p>

            <p>
              In accordance with the Digital Millennium Copyright Act (DMCA), we respond to valid copyright infringement notices.
            </p>

            <p>
              If you believe content linked on this website infringes your copyright, please provide:
            </p>

            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Identification of the copyrighted work</li>
              <li>The exact URL(s) of the material</li>
              <li>Proof of ownership or authorization</li>
              <li>A statement of good faith belief</li>
              <li>A statement made under penalty of perjury</li>
              <li>Your contact information</li>
            </ol>

            <div className="mt-8 p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">Send notices via:</p>
              <p>
                Chat Support:{" "}
                <a href="/support" className="text-primary hover:underline">Open a support ticket</a>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:capcutwaladiddy@gmail.com" className="text-primary hover:underline">capcutwaladiddy@gmail.com</a>
              </p>
            </div>

            <p>
              Upon receiving a valid notice, we will remove or disable access to the content within 24–48 hours.
            </p>

            <p className="font-medium">
              This website does not host any files directly.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DMCA;
