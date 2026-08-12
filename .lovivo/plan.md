# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt ($59 USD)
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings in English. Dates US format (date-fns default `en`, "Jun 12, 2026"). DO NOT use `es` date-fns locale.
- **LIVE DOMAIN CHANGED ~2026-06-15**: production traffic moved `www.rodata-us.store` → `www.getrodata.com`.
- **Traffic profile (2026-08-12)**: ~87% mobile, ~75% from Meta. Single-product store: 1,619 of 2,141 pageviews are `/products/rodata-one`.
- **OWNER PREFERENCES (2026-08-12)** — respect these, do not re-propose:
  - Arrival date belongs in the CHECKOUT ONLY, never on the PDP.
  - NO sizing / returns / shipping FAQ **accordion** inside checkout ("not good practice"). One-line microcopy is OK, an accordion is NOT.
  - No on-site surveys for now.
  - Tracking / instrumentation work is always welcome.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8 near-white), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). `.dark` class exists but many pages render LIGHT. ⚠️ `text-brand-offwhite` / `border-white/20` / `bg-white/15` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK (`bg-[#111315]` / `bg-[#1D2125]`) — dark tokens are correct there.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🛒 Checkout CRO pack v1 (requested 2026-08-12, NOT built yet)

### Goal
Raise `/pagar` → purchase conversion (baseline ~38% IC→PUR, ~8 conv/week). Volume is
too low for A/B testing → ship the whole pack at once and read
`checkout_pay_clicked → checkout_payment_succeeded` before/after.

### Current state (audited 2026-08-12)
- `src/pages/ui/CheckoutUI.tsx` (849 lines): header, `MobileOrderSummary` (open by
  default), left column = Stripe section, right column = desktop order summary with
  an **always-expanded discount code input**, totals, and `Free shipping · Arrives {getEstimatedDelivery()}`.
- `src/components/StripePayment.tsx` (964 lines) owns everything below "Secure Checkout":
  ExpressCheckoutElement (Apple/GPay/Link) → LinkAuthentication → AddressElement →
  deliveryMethodSlot → PaymentElement → billingSlot → **pre-pay trust block (line ~871:
  only "★★★★★ 4.9 · 127 verified riders")** → Submit button (line ~883) → trust row
  (Free U.S. Shipping · Secure Checkout · 30-Day Comfort Guarantee, 11px grey) →
  card logos → Terms/Privacy.
- PDP social-proof strip lives in `src/pages/ui/ProductPageUI.tsx` lines **424–447**
  (3 stacked avatars `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` + Meta-blue
  verified SVG + "Jason R. ✓ and +1,000 riders love the Rodata One").
- All payment errors are surfaced ONLY via transient `toast()` (lines 270, 298, 375,
  429, 464, 471 + `handlePaymentError`). Nothing persists inline near the button.
- ⚠️ **Social proof numbers are inconsistent across the store**:
  - PDP strip: "+1,000 riders"
  - PDP stats bar (`ProductPageUI.tsx` ~line 457): "+800 Happy riders"
  - Checkout pre-pay line: "127 verified **riders**"
  Three different customer counts on the same funnel reads as fake.

### Implementation steps

**STEP 1 — Fix the social-proof inconsistency (do this FIRST, it's free)**
Canonical story: **1,000+ riders served · 127 verified reviews · 4.9★**.
- `StripePayment.tsx` ~line 878: "127 verified riders" → **"127 verified reviews"**.
- `ProductPageUI.tsx` ~line 457 stats bar: "+800 / Happy riders" → **"+1,000 / Riders served"**.
- Leave the PDP strip's "+1,000 riders" as the single source of truth.

**STEP 2 — Port the avatar social-proof strip into checkout**
- Create `src/components/CheckoutSocialProof.tsx` (self-contained, dark tokens).
- Content = compact version of the PDP strip: 3 stacked avatars (reuse
  `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp`, `-space-x-2`, `border-2 border-brand-carbon`)
  + Meta-blue verified SVG, plus ONE short verified quote:
  > **Jason R.** ✓ — *"Rode 6 hours straight and my lower back was fine. Should've bought it sooner."*
  Below it, one line: `★★★★★ 4.9 · 127 verified reviews · 1,000+ riders`.
- Styling: `bg-brand-graphite border border-white/[0.08] rounded-xl px-4 py-3`,
  text `text-xs font-inter text-brand-smoke`, name/number `font-semibold text-brand-offwhite`.
- **Placement**: replace the existing pre-pay block at `StripePayment.tsx` lines
  871–880 (immediately above the Submit button). Do NOT add a second copy at the
  top of the page — one instance, at the moment of maximum doubt.

**STEP 3 — Promote the guarantee from 11px grey footnote to a real risk-reversal badge**
- Today "30-Day Comfort Guarantee" is `text-[11px] text-brand-steel` BELOW the CTA (line ~917).
- Add, directly ABOVE the Submit button (under the social proof strip), a bordered badge:
  `border border-brand-amber/25 bg-brand-amber/[0.06] rounded-xl px-3 py-2.5`,
  `RotateCcw` icon in brand-amber + copy:
  **"30-Day Comfort Guarantee — ride with it for 30 days. If your back doesn't feel better, we refund you. Free size exchange."**
- Keep the small trust row below the CTA but REMOVE the now-duplicated
  "30-Day Comfort Guarantee" chip from it (leave Free U.S. Shipping · Secure Checkout).
- This is microcopy, NOT an accordion → complies with the owner's rule.

**STEP 4 — Persistent inline error banner (biggest silent killer)**
- Add `const [payError, setPayError] = useState<{title:string; help:string} | null>(null)` in `PaymentForm`.
- Set it (in addition to the toast) in: `elements.submit()` error, `confirmPayment` error,
  and `handlePaymentError`. Clear it at the start of `handlePayment`.
- Render it as a persistent block right ABOVE the Submit button:
  `bg-destructive/10 border border-destructive/25 rounded-xl p-3`, with an alert icon.
- Map Stripe `decline_code` / `code` to human, actionable English copy:
  - `insufficient_funds` → "Your bank declined the charge for insufficient funds. Try another card or pay with PayPal."
  - `card_declined` / `generic_decline` → "Your bank declined this card. This is usually a security block — try another card, PayPal, or Apple/Google Pay."
  - `expired_card` → "That card is expired. Check the expiration date or use another card."
  - `incorrect_cvc` / `invalid_cvc` → "The security code doesn't match. Re-check the 3 digits on the back."
  - `incorrect_number` / `invalid_number` → "That card number isn't valid. Please re-check it."
  - `processing_error` → "The bank had a temporary error. Try again in a few seconds."
  - default → the Stripe message + "Try another card or pay with PayPal."
- Under the banner, a one-line escape hatch: "Still stuck? Email support@getrodata.com and we'll place the order for you."
- Reuse the existing `stripeErrorProps` from `src/lib/checkout-tracking.ts` so the
  banner and the `checkout_payment_failed` event stay in sync.

**STEP 5 — Sticky mobile pay bar (87% of traffic is mobile)**
- In `StripePayment.tsx`, add a `md:hidden fixed bottom-0 inset-x-0 z-40` bar:
  `bg-[#1D2125]/95 backdrop-blur border-t border-white/[0.1] px-4 py-3`.
- Left: `Total` + `{amountLabel}`. Right: amber button "Complete Purchase" that calls
  the SAME `handlePayment`.
- Only render it once `isStripeReady` (i.e. inside `PaymentForm`) AND hide it when the
  in-page button is visible — use an `IntersectionObserver` on a ref attached to the
  main Submit button (mirrors the pattern already used on the PDP sticky CTA).
- Add `pb-24 md:pb-0` to the checkout main container so the bar never covers the
  Terms/Privacy links.
- Track it: `trackCheckoutEvent('checkout_pay_clicked', { method: 'sticky_bar', ... })`
  so we can measure whether the bar is actually being used.

**STEP 6 — Collapse the desktop discount field**
- `CheckoutUI.tsx` lines 504–543: the desktop summary shows an always-open
  "Discount code" input. Coupon-hunting is a documented leak (user leaves to Google a code).
- Convert it to the same collapsed pattern already used on mobile (`MobileCouponSection`,
  line 794): a small amber text link "Have a coupon?" that expands on click.
- Best: extract `MobileCouponSection` into a shared `CouponSection` and use it in both places.

**STEP 7 — Non-accordion sizing reassurance (one line, no expandable)**
- In BOTH order summaries (`CheckoutUI.tsx` line ~461 desktop, line ~636 mobile),
  under the variant name (`item.variant.name`), add a single 11px line:
  `<Ruler size={10}/> Free size exchange if it doesn't fit`
- One line only. No accordion, no FAQ block — respects the owner's constraint while
  answering the #1 pre-pay doubt on an apparel-sized product.

### Deferred / secondary (only if steps 1–7 land clean)
- **Collapse `MobileOrderSummary` by default** (currently `useState(true)` at line 601)
  with a persistent one-line header `$59 · Free shipping · Arrives {date}`. Saves ~400px
  of scroll on mobile but hides the arrival date → risky, ship separately and watch.
- **PayPal + payment-area skeleton** to kill the `enabled:false` flicker
  (`PaypalExpressButton.tsx` + the `isStripeReady` spinner at `CheckoutUI.tsx` line 239).
- **Scroll-to-first-missing-field** instead of only the "Required fields" toast
  (`onValidationRequired`, `CheckoutUI.tsx` line 286).

### How to measure (no A/B — volume too low)
Compare the 14 days after ship vs the 14 days before:
- `checkout_pay_clicked` → `checkout_payment_succeeded` rate (the true payment-step CR).
- `checkout_payment_failed` volume by `decline_code` (should stay flat; the banner
  should convert some of those into a retry → watch for a 2nd `pay_clicked` per session).
- `$rageclick` on `/pagar` (should drop).
- Log everything in `.lovivo/cro-log.md`.

## 4. Recent Changes
- 2026-08-12: **CHECKOUT CRO PACK v1 PLANNED** (not built) — social-proof strip + verified quote above the pay button, guarantee promoted to a badge, persistent inline decline-error banner with actionable copy, sticky mobile pay bar, collapsed desktop coupon field, one-line size-exchange microcopy. Also found and scheduled a fix for inconsistent customer counts (+1,000 / +800 / 127) across PDP and checkout.
- 2026-08-12: **CRO FIXES SHIPPED** — (1) checkout delivery window 6–8 → **5–7 business days**; (2) PostHog `autocapture: true` + `rageclick: true`; (3) new `src/lib/checkout-tracking.ts` + micro-events in `StripePayment.tsx` (`checkout_pay_clicked`, `checkout_payment_failed` with decline_code, `checkout_payment_succeeded`, `checkout_wallet_shown`). Owner REJECTED: arrival date on PDP, FAQ accordion in checkout, abandonment survey. Owner CONFIRMED Apple/Google Pay are Active on all domains in Stripe (issue closed).
- 2026-08-12: **CRO DIAGNOSIS** — checkout→purchase drop analyzed. No code regression. Main driver upstream: ATC 6.6%→4.1%, checkout sessions 6→1/day.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible white-on-white steps + STEP_TRANSLATIONS map (ES→EN).
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — dashboard filter pinned to old domain rodata-us.store. Fix in PostHog UI.
- 2026-06-26: Tracking fixes APPLIED — PayPal trackPurchase on capture; double PageView de-dup; usd/USD fallback; ThankYou guard unified to sessionStorage.
- 2026-06-24: Order Tracking page BUILT & SHIPPED — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard.
- 2026-06-18: Footer contact → support@getrodata.com
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal
- 2026-06-10: PaypalExpressButton.tsx — fallbackOrder; localStorage always written
- 2026-06-09: Delivery window — 6–8 business days in CheckoutUI + ProductPageUI

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/) — reused by the new checkout social-proof strip.

## 6. Known Issues
- **(2026-08-12) Social proof numbers inconsistent** — PDP strip "+1,000 riders", PDP stats bar "+800 happy riders", checkout "127 verified riders". Fix in Step 1 of the checkout pack.
- **(2026-08-12) Payment errors only shown as transient toasts** — on mobile a toast can be missed entirely; the user just sees nothing happen. Fix in Step 4.
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout now promises it.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — cross-check against real Dashboard orders.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- ~~Apple/Google Pay domains not registered~~ **RESOLVED 2026-08-12**.

## 7. Pending / Future Sessions
- **P0** Build the Checkout CRO pack v1 (Section 3, steps 1–7) in Craft Mode.
- **P0** ~2026-08-19: read the new micro-events and log results in `.lovivo/cro-log.md`.
- **P0** Dashboard/Meta: audit impressions + frequency per ad; pause the ~12 Aug 3–11 zero-purchase creatives; refresh creative for the fatigued winners.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.