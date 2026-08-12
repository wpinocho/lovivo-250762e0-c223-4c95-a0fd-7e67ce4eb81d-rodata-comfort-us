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
  - Owner has a good eye for visual density — avoid stacking multiple cards in a row.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **`text-brand-steel` at ≤11px on dark is TOO DIM for selling copy** — use `text-brand-smoke` for anything meant to be read (ratings, guarantees). Reserve steel for labels.
- **Avatar rings inside a `bg-brand-graphite` card must use `border-brand-graphite`** (not carbon) or a halo shows.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — ✅ Checkout CRO pack v1.1 SHIPPED (2026-08-12) — now measuring

Nothing in flight. Next action is **measurement on ~2026-08-26**: compare 14 days after vs before on
`checkout_pay_clicked` → `checkout_payment_succeeded`, retry rate after `checkout_payment_failed`,
share of `method: 'sticky_bar'` clicks, and `$rageclick` on `/pagar`. Fill the "Result" line of the
v1.1 entry in `.lovivo/cro-log.md`.

### What v1.1 changed (all shipped)
- `CheckoutSocialProof` REMOVED from the pre-CTA stack in `StripePayment.tsx`; now rendered under the
  mobile order summary (`CheckoutUI.tsx`, `md:hidden -mt-2 mb-6`, in the parent render so it survives a
  future collapse-by-default) and under the desktop summary card (`hidden md:block mt-4`).
- `CheckoutSocialProof` rebuilt as 3 rows: quote → avatars + name + verified check → proof numbers
  (`whitespace-nowrap` segments, `gap-x-1.5 gap-y-1`, `text-brand-smoke`).
- Guarantee badge absorbed the ratings line (★★★★★ 4.9 · 127 verified reviews) and dropped the
  redundant "ride with it for 30 days".
- Sticky mobile pay bar gated: sentinel `<div ref={payAnchorRef}>` above `<PaymentElement>`,
  `reachedPayment` latch (never resets) → renders only when `reachedPayment && !ctaVisible`.
- Failed validation scrolls to the first `[aria-invalid="true"]` field (fallback: the CTA) + toast.
- `method: 'sticky_bar'` tracking untouched.

### Deferred (still valid, not built)
- Collapse `MobileOrderSummary` by default (`useState(true)` → `false`, `CheckoutUI.tsx` ~line 569) with a
  persistent header `$59 · Free shipping · Arrives {date}`.
- PayPal + payment-area skeleton to kill the `enabled:false` flicker.

## 4. Recent Changes
- 2026-08-12: **CHECKOUT CRO PACK v1.1 SHIPPED** — testimonial moved out of the pre-CTA wall to under the order summary (mobile + desktop); `CheckoutSocialProof` rebuilt in 3 rows (fixes inline check, orphaned "1,000+ riders" wrap, dim steel text, avatar ring halo); ratings merged into the guarantee badge; sticky mobile pay bar gated behind a payment-section sentinel; validation failure now scrolls to the offending field.
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
- **(2026-08-12) `lov-search-files` returned 0 matches for strings that exist** in `src/components/StripePayment.tsx` (e.g. `ctaVisible`, `PaymentElement`). Had to fall back to `lov-view`. Re-test next session; report if it persists.
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout promises it.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — cross-check against real Dashboard orders.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.
- ~~Sticky mobile pay bar appears at the very top of `/pagar`~~ **RESOLVED 2026-08-12** (v1.1 sentinel gate).
- ~~`CheckoutSocialProof` rating line wraps badly on 375px~~ **RESOLVED 2026-08-12** (v1.1 3-row rebuild).
- ~~Social proof numbers inconsistent~~ **RESOLVED 2026-08-12**.
- ~~Payment errors only shown as transient toasts~~ **RESOLVED 2026-08-12** (persistent inline banner).
- ~~Apple/Google Pay domains not registered~~ **RESOLVED 2026-08-12**.

## 7. Pending / Future Sessions
- **P0** ~2026-08-26: read the checkout pack results and fill the "Result" line in `.lovivo/cro-log.md` (v1.1 entry).
- **P0** Dashboard/Meta: audit impressions + frequency per ad; pause the ~12 Aug 3–11 zero-purchase creatives; refresh creative for the fatigued winners.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P1** Collapse `MobileOrderSummary` by default with a persistent `$59 · Free shipping · Arrives {date}` header.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.