import { EcommerceTemplate } from '@/templates/EcommerceTemplate'

const PrivacyPolicy = () => {
  return (
    <EcommerceTemplate>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: April 2025</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Data Controller</h2>
          <p className="text-foreground/80 leading-relaxed">
            Rodata is responsible for the processing of your personal data. This Privacy Policy describes how we collect, use, store, and protect your personal information when you use our website and services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. Data We Collect</h2>
          <p className="text-foreground/80 leading-relaxed">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Identity data:</strong> first name, last name, email address, and phone number.</li>
            <li><strong>Shipping data:</strong> mailing address, city, state, ZIP code, and country.</li>
            <li><strong>Payment data:</strong> processed securely by certified payment providers. We do not store card details.</li>
            <li><strong>Browsing data:</strong> IP address, browser type, pages visited, and time on site.</li>
            <li><strong>Order data:</strong> purchase history, products ordered, and preferences.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. Purpose of Processing</h2>
          <p className="text-foreground/80 leading-relaxed">We use your personal data to:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li>Process and fulfill your orders and payments.</li>
            <li>Send you order confirmations and shipping updates.</li>
            <li>Provide customer service and support.</li>
            <li>Send marketing and promotional communications (only with your consent).</li>
            <li>Improve our website and user experience.</li>
            <li>Comply with legal and fiscal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Cookies and Tracking</h2>
          <p className="text-foreground/80 leading-relaxed">
            Our site uses cookies and similar technologies to improve your browsing experience, analyze site traffic, and personalize content. Essential cookies are required for the site to function. Analytics cookies help us understand how you interact with our pages. You may configure your browser to reject cookies, though this may affect site functionality.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Sharing Data with Third Parties</h2>
          <p className="text-foreground/80 leading-relaxed">We may share your information with trusted third parties only when necessary to:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Process payments:</strong> via certified payment processors.</li>
            <li><strong>Ship orders:</strong> via carriers and fulfillment services.</li>
            <li><strong>Analyze site performance:</strong> via analytics tools.</li>
            <li><strong>Comply with law:</strong> when required by authorities.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            We do not sell, rent, or share your personal data with third parties for marketing purposes without your explicit consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Data Security</h2>
          <p className="text-foreground/80 leading-relaxed">
            We implement technical, administrative, and physical security measures to protect your personal information against unauthorized access, loss, alteration, or destruction. No data transmission or storage system is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
          <p className="text-foreground/80 leading-relaxed">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground/80">
            <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> request deletion of your personal data.</li>
            <li><strong>Objection:</strong> object to the processing of your data for certain purposes.</li>
            <li><strong>Portability:</strong> receive your data in a structured, commonly used format.</li>
          </ul>
          <p className="text-foreground/80 leading-relaxed">
            To exercise any of these rights, contact us through the support channels available on our website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
          <p className="text-foreground/80 leading-relaxed">
            We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including any legal, accounting, or reporting requirements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">9. Policy Updates</h2>
          <p className="text-foreground/80 leading-relaxed">
            We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with the updated date. We recommend reviewing it periodically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
          <p className="text-foreground/80 leading-relaxed">
            If you have questions or concerns about this Privacy Policy or the processing of your personal data, please contact us through the support channels available on our website.
          </p>
        </section>
      </div>
    </EcommerceTemplate>
  )
}

export default PrivacyPolicy