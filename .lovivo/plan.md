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

## 3. Active Plan — 🔴 Google Pay mobile failure investigation (opened 2026-08-13)

### What happened
Owner ran a test purchase with Google Pay. **Mobile → `CALLBACK_TIMED_OUT`. Desktop → worked** (declined only
because his own card is MXN-only: `decline_code: currency_not_supported`, which is a test-card artifact, NOT a bug).

### Hard evidence from PostHog (2026-08-13)
- `purchase` by device, last 30d: **Mobile 23 (last = 2026-08-09 19:53), Desktop 7 (last = today, owner test), Tablet 1.**
  → **Mobile purchases have been flat at ZERO for 4 days** while mobile is ~87% of traffic. This is the money leak.
- The failing mobile session (`getrodata.com/pagar`, Android Chrome, 22:39–22:42) fired `checkout_wallet_shown`
  with `methods: ["googlePay","link"]` and then **nothing** — no `checkout_pay_clicked`, no `checkout_payment_failed`.
  Google Pay killed its own sheet before our `onConfirm` ever reported back → we were **blind by design**.
- Only 1 `checkout_payment_failed` in 30d and it is the owner's desktop `currency_not_supported`.

### ROOT-CAUSE HYPOTHESIS (strong, not yet proven)
`handleExpressCheckoutConfirm` in `src/components/StripePayment.tsx` runs, INSIDE the Google Pay authorization
callback: `elements.submit()` → `callEdge("payments-create-intent")` → `stripe.confirmPayment()`.
Google Pay aborts the sheet with `CALLBACK_TIMED_OUT` when the merchant callback does not resolve in time.
A Supabase edge-function round-trip on a cold start + 4G easily exceeds that ceiling — which is exactly why it
**passes on desktop and fails on mobile with identical code**.
⚠️ Dangerous side effect: our JS keeps running after the sheet dies, so a charge can be created while the
customer sees an error. Cross-check Stripe for orphan PaymentIntents around the failed attempts.

### SHIPPED THIS SESSION (measurement first, fix next)
- `src/lib/checkout-tracking.ts`: 3 new typed events — `checkout_wallet_cancelled`, `checkout_wallet_timing`,
  `checkout_wallet_load_error`.
- `src/components/StripePayment.tsx`:
  - `checkout_wallet_timing` now fires right after `payments-create-intent` with `intent_ms` + `slow` (>4000ms)
    → this is the number that proves or kills the timeout hypothesis, sliceable by `device_type`.
  - `onCancel` on `ExpressCheckoutElement` → `checkout_wallet_cancelled` (the only signal we get when Google Pay
    dismisses its own sheet).
  - `onLoadError` → `checkout_wallet_load_error`.

### NEXT STEP (do this first next session)
1. Query: `SELECT properties.device_type, avg(properties.intent_ms), max(properties.intent_ms), count()
   FROM events WHERE event='checkout_wallet_timing' GROUP BY 1`.
   - If mobile `intent_ms` > ~3000 → hypothesis confirmed.
2. **The fix if confirmed**: pre-create the PaymentIntent BEFORE the wallet sheet opens (on `reachedPayment` /
   `onReady`) and cache the `client_secret`, so `onConfirm` only calls `stripe.confirmPayment()` and returns in
   milliseconds. This is the standard remedy for Google Pay callback timeouts.
3. Also compare `checkout_wallet_shown` → `checkout_pay_clicked` on mobile; a big gap = sheets dying silently.

## 4. Recent Changes
- 2026-08-13: **GOOGLE PAY MOBILE DIAGNOSIS + INSTRUMENTATION** — PostHog shows zero mobile purchases since 2026-08-09 while mobile is 87% of traffic; the failing mobile wallet session emitted no failure event at all. Added `checkout_wallet_timing` (`intent_ms`), `checkout_wallet_cancelled` and `checkout_wallet_load_error` so the Google Pay `CALLBACK_TIMED_OUT` becomes measurable. Root cause suspected: the `payments-create-intent` round-trip runs inside the Google Pay callback and blows its timeout on mobile networks.
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
- **(2026-08-13) ZERO mobile purchases since 2026-08-09 19:53 UTC** while mobile = 87% of traffic. Highest-priority open item.
- **(2026-08-13) Google Pay `CALLBACK_TIMED_OUT` on mobile** — see Active Plan. Desktop unaffected.
- **(2026-08-13) `ProductExpressCheckout.tsx` (PDP wallet) is still hardcoded to Mexico**: `country: 'MX'`, currency fallback `'mxn'`, Spanish labels (`'Envío'`) in the wallet sheet. It ALSO does create-order + create-intent inside the wallet callback → same timeout exposure as checkout. NOT changed yet because `country` must match the Stripe account country — verify the connected account's country before touching it.
- **(2026-08-12) `lov-search-files` is unreliable in this repo** — returns 0 matches for strings that exist. Prefer `lov-view` with inferred paths.
- **(2026-08-12) `lov-view` with two line ranges only returns the FIRST range** — request ranges one at a time.
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout promises it.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.
- `checkout_payment_succeeded` is declared in `CheckoutEventName` but has NEVER fired in 30d — the manual card path likely never emits it. Wire it up to get a clean success/failure ratio.

## 7. Pending / Future Sessions
- **P0** Read `checkout_wallet_timing.intent_ms` by device (needs ~24–48h of traffic) and, if confirmed, pre-create the PaymentIntent before the wallet sheet opens.
- **P0** Check Stripe for orphan PaymentIntents / charges created after a `CALLBACK_TIMED_OUT` — a customer may have been charged without a confirmation screen.
- **P0** Write the v1.2 entry + v1.1 "Result" line in `.lovivo/cro-log.md` (still not done).
- **P0** ~2026-08-26: read the checkout CRO pack results.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Localize `ProductExpressCheckout.tsx` to US (country/currency/labels) once the Stripe account country is confirmed.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.