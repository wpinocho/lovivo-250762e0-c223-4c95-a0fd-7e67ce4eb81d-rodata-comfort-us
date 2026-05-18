import { EcommerceTemplate } from '@/templates/EcommerceTemplate'

const TermsAndConditions = () => {
  return (
    <EcommerceTemplate>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
        <p className="text-muted-foreground text-sm">Last updated: April 2025</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-foreground/80 leading-relaxed">
            By accessing and using this website, you agree to comply with these Terms and Conditions. If you disagree with any part of these terms, please do not use our site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. Use of Site</h2>
          <p className="text-foreground/80 leading-relaxed">
            You agree to use this site only for lawful purposes and in a way that does not infringe the rights of others or restrict other users' access. Use of the site for fraudulent or illegal activities is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. Products and Prices</h2>
          <p className="text-foreground/80 leading-relaxed">
            We strive to display accurate product information, including descriptions, images, and prices. However, we do not guarantee that all information is completely accurate. Prices are subject to change without notice. We reserve the right to correct any pricing or description errors and to cancel affected orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Purchase Process</h2>
          <p className="text-foreground/80 leading-relaxed">
            By placing an order, you are making an offer to purchase. We reserve the right to accept or decline any order. Once confirmed, you will receive an email confirmation. The purchase contract is formed at the moment we process your payment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Payment Methods</h2>
          <p className="text-foreground/80 leading-relaxed">
            We accept the payment methods listed on our site. All payment information is processed securely through certified payment providers. We do not store credit or debit card details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Shipping and Delivery</h2>
          <p className="text-foreground/80 leading-relaxed">
            Shipping times and costs vary by location and selected shipping method. We are not responsible for delays caused by the carrier, customs, or events beyond our control. Delivery timeframes are estimates and do not constitute a guarantee.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Returns and Refunds</h2>
          <p className="text-foreground/80 leading-relaxed">
            If you are not satisfied with your purchase, you may request a return within the timeframe stated in our return policy. Products must be in their original condition, unused, and with all original packaging. Refunds will be processed to the same payment method used in the original purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">8. Intellectual Property</h2>
          <p className="text-foreground/80 leading-relaxed">
            All content on this site, including text, images, logos, graphics, and software, is protected by intellectual property laws. Reproduction, distribution, or modification without express written authorization is prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">9. Limitation of Liability</h2>
          <p className="text-foreground/80 leading-relaxed">
            We shall not be liable for any indirect, incidental, or consequential damages arising from the use of or inability to use our site or products. Our maximum liability is limited to the amount paid for the product in question.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">10. Modifications</h2>
          <p className="text-foreground/80 leading-relaxed">
            We reserve the right to modify these Terms and Conditions at any time. Changes take effect upon publication on the site. Continued use of the site after any modification constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
          <p className="text-foreground/80 leading-relaxed">
            If you have questions about these Terms and Conditions, please contact us through the support channels available on our website.
          </p>
        </section>
      </div>
    </EcommerceTemplate>
  )
}

export default TermsAndConditions