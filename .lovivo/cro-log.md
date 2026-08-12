# CRO Log
<!-- This file is maintained by Lovivo AI to track conversion optimization work.
     READ this file before starting any CRO analysis to avoid repeating past work.
     UPDATE this file after every change with hypothesis, implementation, and results. -->

## Baseline
<!-- Record your funnel metrics here BEFORE making changes. Update with new baselines after significant changes. -->
<!-- Example:
- **Date**: 2026-03-25
- **Period**: 7 days
- **Funnel**: pageview(225) → viewcontent(203, 90%) → photo_uploaded(8, 3.9%) → addtocart(1) → purchase(0)
- **Bottleneck**: viewcontent → photo_uploaded (96% drop-off)
- **Device split**: Mobile 67%, Desktop 33%
- **Top sources**: direct 45%, meta ads 30%, organic 25%
-->

- **Date**: 2026-08-12
- **Period**: 30 days
- **Funnel**: viewcontent(1,603) → addtocart(99, 6.2%) → initiatecheckout(85) → purchase(32, 38% IC→PUR)
- **Weekly IC→PUR**: Jul13-19 48% | Jul20-26 22% | Jul27-Aug2 30% | Aug3-9 50% | Aug10-12 0% (n=5, not significant)
- **Bottleneck**: ATC rate fell 6.6% → 4.1%; checkout sessions/day 6 → 1
- **Device split**: Mobile ~87%
- **Top sources**: Meta ~75% (incl. Facebook in-app browser)

## Changes
<!-- Log every CRO change. Format:
### YYYY-MM-DD — Short description
- **Hypothesis**: What you think is wrong and why this change should fix it
- **Change**: What was actually modified
- **Files**: Which files were edited
- **Metric to watch**: Which conversion step should improve
- **Result**: (fill in after 5-7 days) before% → after%, verdict: ✅ kept / ❌ reverted / ➡️ inconclusive
-->

### 2026-08-12 — Checkout CRO pack v1.1 (split the pre-CTA stack, social-proof UI rebuild, gated sticky bar)
- **Hypothesis**: v1 stacked two cards (testimonial + guarantee) directly above the pay button — a wall that pushes the CTA down and gets neither block read. Separating them makes the testimonial work as *framing* (seen by 100% of visitors under the order summary) and the guarantee work as *risk reversal* at the decision moment. Additionally, the sticky pay bar rendering from the top of the page produces wasted taps ("Required fields" toast) before the user has entered anything → likely rage-click source.
- **Change**:
  - `CheckoutSocialProof` moved OUT of the pre-CTA stack; now rendered under the mobile order summary and under the desktop summary card.
  - `CheckoutSocialProof` rebuilt in 3 rows (quote / avatars + name + verified check / proof numbers). Fixes: inline blue check breaking the sentence, orphaned "1,000+ riders" + dangling `·` on 375px (`whitespace-nowrap` segments), too-dim `text-brand-steel` on the strongest proof line (→ `brand-smoke`), avatar ring `border-brand-carbon` mismatching the `brand-graphite` card.
  - Guarantee badge: copy tightened (dropped redundant "ride with it for 30 days") + absorbed the ratings line (★★★★★ 4.9 · 127 verified reviews) so the decision moment keeps proof without a second card.
  - Sticky mobile pay bar gated behind an IntersectionObserver sentinel above `<PaymentElement>` (`reachedPayment` latch, never resets) → `reachedPayment && !ctaVisible`.
  - Failed validation now scrolls to the first `[aria-invalid]` field (fallback: the CTA) in addition to the toast.
- **Files**: `src/components/CheckoutSocialProof.tsx`, `src/components/StripePayment.tsx`, `src/pages/ui/CheckoutUI.tsx`
- **Metric to watch**: `checkout_pay_clicked` → `checkout_payment_succeeded`; share of `method: 'sticky_bar'` clicks that convert; `$rageclick` on `/pagar`
- **Result**: (fill ~2026-08-26)

### 2026-08-12 — Checkout CRO pack v1 (social proof, risk reversal, decline recovery, mobile sticky bar)
- **Hypothesis**: The payment step leaks for 4 reasons: (1) three contradictory customer counts across the funnel (+1,000 / +800 / 127) make the social proof read as fake; (2) the only reassurance above the pay button is a 12px "4.9 · 127 verified riders" line while the 30-day guarantee sits below the fold as an 11px grey footnote; (3) card declines are surfaced ONLY as transient toasts — on mobile (87% of traffic) the user sees nothing happen and leaves instead of retrying; (4) the CTA sits far below the Stripe accordion on mobile.
- **Change**:
  - **Consistency**: checkout "127 verified riders" → "127 verified **reviews**"; PDP stats bar "+800 Happy riders" → "**+1,000 Riders served**". Canonical story = 1,000+ riders · 127 verified reviews · 4.9★.
  - **Social proof in checkout**: new `CheckoutSocialProof` (3 stacked avatars + Meta-blue verified check + Jason R. quote + rating line) placed immediately above the pay button, replacing the bare rating line.
  - **Risk reversal**: 30-Day Comfort Guarantee promoted from footnote to a bordered amber badge ABOVE the CTA (refund + free size exchange); removed the now-duplicate chip from the trust row below.
  - **Decline recovery**: persistent inline error banner above the CTA with human copy mapped from Stripe `decline_code`/`code` (`src/lib/payment-errors.ts`), plus an email escape hatch. Set on `elements.submit()` error, `confirmPayment` error and exceptions; cleared on each new attempt.
  - **Sticky mobile pay bar** (`md:hidden`, IntersectionObserver on the real CTA): Total + Complete Purchase; fires `checkout_pay_clicked` with `method: 'sticky_bar'` so usage is measurable. Added `pb-24 md:pb-0` to the checkout container.
  - **Coupon leak**: desktop always-open "Discount code" input collapsed behind "Have a coupon?" — `MobileCouponSection` extracted into a shared `CouponSection` used by both summaries.
  - **Sizing doubt**: one-line `Free size exchange if it doesn't fit` under the variant name in both order summaries (no accordion, per owner's rule).
- **Files**: `src/components/CheckoutSocialProof.tsx` (new), `src/lib/payment-errors.ts` (new), `src/components/StripePayment.tsx`, `src/pages/ui/CheckoutUI.tsx`, `src/pages/ui/ProductPageUI.tsx`
- **Metric to watch**: `checkout_pay_clicked` → `checkout_payment_succeeded` (payment-step CR, baseline ~38% IC→PUR); retry rate after `checkout_payment_failed` (2nd `pay_clicked` in the same session); `$rageclick` on `/pagar`; share of `pay_clicked` with `method: 'sticky_bar'`.
- **Result**: (read ~2026-08-26 — 14 days after vs 14 days before)

### 2026-08-12 — Shorter delivery window + checkout instrumentation
- **Hypothesis**: (1) Checkout reveals "Arrives Aug 20–24" (6–8 business days) for the first time at payment; users bounce from /pagar back to the PDP in 5–16s. A shorter, more credible window reduces sticker shock at the payment step. (2) We are blind to clicks and card declines (every session had click_count: 0, zero decline visibility), so no further diagnosis is possible without instrumentation.
- **Change**:
  - Transit window 6–8 → **5–7 business days** in `getEstimatedDelivery()` (checkout only — PDP intentionally keeps no arrival date, per store owner).
  - PostHog `autocapture: true` + `rageclick: true`.
  - New micro-events: `checkout_pay_clicked`, `checkout_payment_failed` (error_code, decline_code, error_type, stage), `checkout_payment_succeeded`, `checkout_wallet_shown` (available wallet methods). All carry device_type, is_in_app_browser, utm_source/campaign/content.
- **Files**: `src/pages/ui/CheckoutUI.tsx`, `src/contexts/PostHogContext.tsx`, `src/components/StripePayment.tsx`, `src/lib/checkout-tracking.ts` (new)
- **Metric to watch**: initiatecheckout → purchase (baseline 38% 30d / 50% Aug 3-9); decline rate from `checkout_payment_failed`
- **Result**: (pending, check ~2026-08-19)

## Active Experiments
<!-- A/B tests currently running. Include flag_key, start date, variants, and target metric. -->
None

## Ruled Out
<!-- Changes that were tried and didn't work, or hypotheses that were disproven.
     This prevents repeating failed approaches. -->
- **Code regression** (2026-08-12): last commit before the drop was 2026-07-03. Nothing shipped Aug 3–12.
- **Broken checkout / JS errors** (2026-08-12): 15/15 abandoned checkout sessions had `error_signals: 0`.
- **Apple Pay / Google Pay not registered** (2026-08-12): DISPROVEN. Store owner confirmed all domains (getrodata.com, www.getrodata.com, lovivo.app previews) show Active for Apple Pay / Google Pay / Link in the Stripe dashboard, and wallet buttons render on live checkout.
- **Objection accordion (sizing/returns/shipping) inside checkout** (2026-08-12): rejected by store owner — not considered good practice for their brand. Do not re-propose.
- **Arrival date on the PDP** (2026-08-12): rejected by store owner — delivery date stays in checkout only.

## Micro-Events Status
<!-- Track which micro-events have been instrumented for the main drop-off step.
     Check items as they're added to the codebase. -->
<!-- Example:
- [ ] element_visible (tracks if the key UI element enters viewport)
- [ ] cta_clicked
- [ ] action_started
- [ ] action_completed
- [ ] action_failed (with error_type property)
-->