# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt ($59 USD)
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings in English. Dates US format (date-fns default `en`). DO NOT use `es` locale.
- **LIVE DOMAIN CHANGED ~2026-06-15**: production traffic moved `www.rodata-us.store` → `www.getrodata.com`.
- **Traffic profile (2026-08-12)**: ~87% mobile, ~75% from Meta. Single-product store: 1,619 of 2,141 pageviews are `/products/rodata-one`.
- **CANONICAL SOCIAL PROOF (2026-08-12)**: **1,000+ riders served · 127 verified reviews · 4.9★**. Never introduce a 4th number.
- **OWNER PREFERENCES** — respect these, do not re-propose:
  - Arrival date belongs in the CHECKOUT ONLY, never on the PDP.
  - NO sizing / returns / shipping FAQ **accordion** inside checkout. One-line microcopy is OK, an accordion is NOT.
  - No on-site surveys for now.
  - Tracking / instrumentation work is always welcome.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — ✅ Checkout CRO pack v1 SHIPPED (2026-08-12)

All 7 steps built and staged. Nothing pending from this pack.

### What is now live in checkout (`/pagar`)
1. **Consistent social proof** — checkout says "127 verified reviews"; PDP stats bar says "+1,000 / Riders served"; PDP strip still "+1,000 riders".
2. **`src/components/CheckoutSocialProof.tsx`** (new) — 3 stacked avatars + Meta-blue verified check + Jason R. quote + `★★★★★ 4.9 · 127 verified reviews · 1,000+ riders`. Rendered ONCE, right above the pay button in `StripePayment.tsx`.
3. **Guarantee badge** — amber-bordered risk-reversal block above the CTA (refund + free size exchange). Duplicate chip removed from the trust row below the CTA.
4. **Persistent decline banner** — `src/lib/payment-errors.ts` (new) maps Stripe `decline_code`/`code` → actionable English copy + `support@getrodata.com` escape hatch. Rendered above the CTA, cleared on each new attempt. Toasts kept as a secondary signal.
5. **Sticky mobile pay bar** — `md:hidden fixed bottom-0`, shown via IntersectionObserver when the real CTA is off-screen. Fires `checkout_pay_clicked` with `method: 'sticky_bar'`. Container got `pb-24 md:pb-0`.
6. **Collapsed coupon on desktop** — `MobileCouponSection` renamed to shared `CouponSection`, now used by BOTH summaries behind "Have a coupon?".
7. **Size microcopy** — one line `Free size exchange if it doesn't fit` under the variant name in both order summaries (no accordion).

### How to measure (no A/B — volume too low, ~8 conv/week)
Compare 14 days after vs 14 days before:
- `checkout_pay_clicked` → `checkout_payment_succeeded` rate.
- Retry rate after `checkout_payment_failed` (a 2nd `pay_clicked` in the same session = the banner worked).
- Share of `pay_clicked` with `method: 'sticky_bar'`.
- `$rageclick` on `/pagar` (should drop).
Log results in `.lovivo/cro-log.md` (entry already stubbed, "Result" line to fill ~2026-08-26).

### Deferred (only if the pack reads positive)
- Collapse `MobileOrderSummary` by default (`useState(true)` at `CheckoutUI.tsx` ~line 601) with a persistent header `$59 · Free shipping · Arrives {date}`. Hides the arrival date → ship separately.
- PayPal + payment-area skeleton to kill the `enabled:false` flicker.
- Scroll-to-first-missing-field instead of only the "Required fields" toast.

## 4. Recent Changes
- 2026-08-12: **CHECKOUT CRO PACK v1 SHIPPED** — new `CheckoutSocialProof.tsx` + `payment-errors.ts`; social-proof strip + guarantee badge + persistent decline banner above the pay button; sticky mobile pay bar with `sticky_bar` tracking; desktop coupon collapsed via shared `CouponSection`; size-exchange microcopy in both summaries; customer counts unified to 1,000+ / 127 / 4.9.
- 2026-08-12: **CRO FIXES SHIPPED** — delivery window 6–8 → 5–7 business days; PostHog `autocapture` + `rageclick`; `src/lib/checkout-tracking.ts` micro-events. Owner REJECTED: arrival date on PDP, FAQ accordion in checkout, abandonment survey. Apple/Google Pay confirmed Active.
- 2026-08-12: **CRO DIAGNOSIS** — checkout→purchase drop analyzed. No code regression. Main driver upstream: ATC 6.6%→4.1%, checkout sessions 6→1/day.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible white-on-white steps + STEP_TRANSLATIONS map (ES→EN).
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — dashboard filter pinned to old domain rodata-us.store. Fix in PostHog UI.
- 2026-06-26: Tracking fixes APPLIED — PayPal trackPurchase on capture; double PageView de-dup; usd/USD fallback; ThankYou guard unified to sessionStorage.
- 2026-06-24: Order Tracking page BUILT & SHIPPED — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard.
- 2026-06-18: Footer contact → support@getrodata.com
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal
- 2026-06-10: PaypalExpressButton.tsx — fallbackOrder; localStorage always written

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/) — used by the PDP strip AND `CheckoutSocialProof.tsx`.

## 6. Known Issues
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout promises it.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — cross-check against real Dashboard orders.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.
- ~~Social proof numbers inconsistent~~ **RESOLVED 2026-08-12**.
- ~~Payment errors only shown as transient toasts~~ **RESOLVED 2026-08-12** (persistent inline banner).
- ~~Apple/Google Pay domains not registered~~ **RESOLVED 2026-08-12**.

## 7. Pending / Future Sessions
- **P0** ~2026-08-26: read the checkout pack results and fill the "Result" line in `.lovivo/cro-log.md`.
- **P0** Dashboard/Meta: audit impressions + frequency per ad; pause the ~12 Aug 3–11 zero-purchase creatives; refresh creative for the fatigued winners.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.