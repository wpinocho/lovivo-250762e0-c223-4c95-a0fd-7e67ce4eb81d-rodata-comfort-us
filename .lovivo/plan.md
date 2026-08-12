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
  - Owner has a good eye for visual density — avoid stacking multiple cards in a row. **Prefers compact single-strip social proof over tall testimonial cards** (2026-08-12).
  - Owner asks for RESEARCH before UX pattern changes — cite sources, don't assert.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **`text-brand-steel` at ≤11px on dark is TOO DIM for selling copy** — use `text-brand-smoke` for anything meant to be read (ratings, guarantees). Reserve steel for labels.
- **Avatar rings inside a `bg-brand-graphite` card must use `border-brand-graphite`** (not carbon) or a halo shows.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — ✅ Checkout CRO pack v1.2 SHIPPED (2026-08-12) — now measuring

Nothing in flight. Next action is **measurement on ~2026-08-26**: compare 14 days after vs before on
`checkout_pay_clicked` → `checkout_payment_succeeded`, retry rate after `checkout_payment_failed`,
share of `method: 'sticky_bar'` clicks, and `$rageclick` on `/pagar`.
⚠️ **`.lovivo/cro-log.md` still needs a v1.2 entry** (was not written this session — budget). Add it next session
alongside the v1.1 "Result" line.

### What v1.2 changed (all shipped)
- `CheckoutSocialProof` rebuilt COMPACT: single strip, avatars left + 2 text rows
  (`Jason R. ✓ and 1,000+ riders already ride with it` / `★ 4.9 from 127 verified reviews`).
  Testimonial quote REMOVED from checkout (still on PDP) — density beat the quote.
- Mobile order of elements flipped: social-proof strip now sits **ABOVE** `MobileOrderSummary`
  (`md:hidden mb-3`) — proof frames the price. Desktop unchanged (still under the summary card).
- `MobileOrderSummary` now **collapsed by default** (`useState(false)`), header restructured to two
  lines: `Order summary (n) · $total` + persistent `Free shipping · Arrives {date}` shown only when
  collapsed. Coupon field is now behind that tap (bonus: less coupon-hunting leakage).
- Sticky mobile pay bar **KEPT AS-IS** — research confirms it's standard, not an anti-pattern.

### Research backing v1.2 (2026-08-12, do not re-litigate)
- **Sticky bottom pay bar on mobile = best practice.** Baymard: 11.6% of users mistake a review step
  for a confirmation step; a persistent primary "Place Order" button is the element that disambiguates.
  A/B evidence cites 5–12% lift on mobile checkout completion. Caveat that WE ALREADY HANDLE: it must
  not appear before the user reaches the payment section (our `reachedPayment` sentinel gate).
- **Mobile order summary collapsed by default = best practice.** Always-visible eats the viewport,
  fully hidden creates uncertainty; the convention is a one-line "Show order summary ▼ $XX" that
  expands on tap, with total (and here, shipping + arrival) always readable.
- Sources: baymard.com/learn/checkout-flow-ux-optimization, baymard.com/blog/accordion-checkout-usability,
  cartylabs.com Shopify checkout UX 2026, btng.studio mobile checkout optimization.

### Deferred (still valid, not built)
- PayPal + payment-area skeleton to kill the `enabled:false` flicker.
- Consider re-adding a one-line quote to the strip IF the compact version underperforms.

## 4. Recent Changes
- 2026-08-12: **CHECKOUT CRO PACK v1.2 SHIPPED** — `CheckoutSocialProof` rebuilt as a compact single strip (avatars + 2 rows, quote dropped); strip moved ABOVE the mobile order summary; `MobileOrderSummary` collapsed by default with a persistent `Free shipping · Arrives {date}` sub-line; sticky pay bar kept after research confirmed it's the correct pattern.
- 2026-08-12: **CHECKOUT CRO PACK v1.1 SHIPPED** — testimonial moved out of the pre-CTA wall to under the order summary (mobile + desktop); `CheckoutSocialProof` rebuilt in 3 rows; ratings merged into the guarantee badge; sticky mobile pay bar gated behind a payment-section sentinel; validation failure now scrolls to the offending field.
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
- **(2026-08-12) `lov-search-files` is unreliable in this repo** — returns 0 matches for strings that exist, and returns match line numbers that don't correspond to the query. Prefer `lov-view` with inferred paths.
- **(2026-08-12) `lov-view` with two line ranges only returns the FIRST range** — request ranges one at a time.
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout promises it.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — cross-check against real Dashboard orders.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.
- ~~Social proof block too tall / dense~~ **RESOLVED 2026-08-12** (v1.2 compact strip).
- ~~Sticky mobile pay bar appears at the very top of `/pagar`~~ **RESOLVED 2026-08-12** (v1.1 sentinel gate).
- ~~Payment errors only shown as transient toasts~~ **RESOLVED 2026-08-12** (persistent inline banner).

## 7. Pending / Future Sessions
- **P0** Write the v1.2 entry + v1.1 "Result" line in `.lovivo/cro-log.md`.
- **P0** ~2026-08-26: read the checkout pack results (see Active Plan for the metric list).
- **P0** Dashboard/Meta: audit impressions + frequency per ad; pause the ~12 Aug 3–11 zero-purchase creatives; refresh creative for the fatigued winners.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.