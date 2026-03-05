import Layout from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 5, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p>
              Welcome to HartLong. Your privacy is important to us. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website. Please read this policy carefully.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Information:</strong> Name, email address, and other details you provide when creating an account or contacting us.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, browser type, device information, and IP address.</li>
              <li><strong>Cookies &amp; Tracking Data:</strong> Information collected through cookies, web beacons, and similar technologies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Cookies Usage</h2>
            <p>
              We use cookies to enhance your experience on our website. Cookies are small data files stored on your device
              that help us understand how you use our site, remember your preferences, and improve our services.
            </p>
            <p>You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of the website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Google AdSense &amp; Advertising Cookies</h2>
            <p className="font-medium text-foreground bg-muted/50 border border-border rounded-lg p-4">
              This website uses Google AdSense, a third-party advertising service that uses cookies to serve ads based on
              users' prior visits.
            </p>
            <p>
              Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this site
              and/or other sites on the internet. You may opt out of personalised advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
            <p>We may use third-party services that collect, monitor, and analyse data to improve our service. These include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google AdSense:</strong> For displaying advertisements.</li>
              <li><strong>Google Analytics:</strong> For website traffic analysis.</li>
              <li><strong>TradingView:</strong> For live market data and chart widgets.</li>
              <li><strong>Authentication Providers:</strong> For secure user login and account management.</li>
            </ul>
            <p>Each third-party service operates under its own privacy policy. We encourage you to review their policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Data Protection</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorised access,
              alteration, disclosure, or destruction. These include encrypted data transmission, secure servers, and regular
              security audits.
            </p>
            <p>
              However, no method of electronic transmission or storage is 100% secure. While we strive to protect your data,
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. User Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal obligations.</li>
              <li><strong>Opt-Out:</strong> Opt out of marketing communications and personalised advertising at any time.</li>
              <li><strong>Data Portability:</strong> Request your data in a structured, commonly used format.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us through the website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
              revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our website.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
