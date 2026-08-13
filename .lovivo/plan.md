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
  - **Owner wants clear separation between "diagnosed" and "fixed"** (2026-08-13) — never imply a fix shipped when only measurement shipped.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **`text-brand-steel` at ≤11px on dark is TOO DIM for selling copy** — use `text-brand-smoke` for anything meant to be read (ratings, guarantees). Reserve steel for labels.
- **Avatar rings inside a `bg-brand-graphite` card must use `border-brand-graphite`** (not carbon) or a halo shows.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🟠 Payment reliability: measure all 3 methods (updated 2026-08-13)

### ⚠️ CORRECTION to the 2026-08-13 first diagnosis (I overstated it)
Earlier I claimed "mobile purchases flat at ZERO for 4 days = the money leak". **That was wrong.**
Real daily data (`purchase` + checkout funnel, last 14d):
| date | checkout views | purchases |
|---|---|---|
| 08-13 | 5 | 2 (owner tests) |
| 08-12 | 7 | **0** ← only genuinely suspicious day |
| 08-11 | 1 | 0 |
| 08-10 | 1 | 0 |
| 08-09 | 6 | 2 |
→ Aug 10–11 had **almost no checkout traffic at all** (1 view/day). The "4-day drought" was mostly a
TRAFFIC collapse, not a broken checkout. Only **Aug 12 (7 checkout views → 0 purchases)** looks like a
real conversion problem. Do not repeat the "checkout is broken" narrative without this nuance.

### Google Pay CALLBACK_TIMED_OUT — status: NOT FIXED, only instrumented
- Owner hit `CALLBACK_TIMED_OUT` on mobile Google Pay, then **retried later the same day and it WORKED**.
  → Intermittent, consistent with a latency/timeout race, not a hard break.
- **Root-cause hypothesis unchanged**: `handleExpressCheckoutConfirm` runs `elements.submit()` →
  `callEdge("payments-create-intent")` → `stripe.confirmPayment()` *inside* the Google Pay callback.
  Google Pay aborts its sheet if that callback is slow. Cold edge start + 4G = over the ceiling.
- **No code fix has been applied to this.** The remedy (pre-create the PaymentIntent before the wallet
  sheet opens, cache `client_secret`, make `onConfirm` a millisecond operation) is still PENDING.

### Instrumentation status per payment method (2026-08-13)
| method | pay click | failure | success | notes |
|---|---|---|---|---|
| Stripe card (PaymentElement) | ✅ | ✅ `elements_submit` + `confirm_payment` | ✅ | fully measurable |
| Wallet (Google/Apple Pay) | ✅ | ✅ + `checkout_wallet_timing/cancelled/load_error` | ⚠️ no `succeeded` event | timing added 08-13 |
| PayPal | ✅ `checkout_paypal_started` | ✅ `paypal_create_order` / `paypal_capture` / `paypal_sdk` | ✅ | **added 08-13, was 100% blind** |

⚠️ `checkout_wallet_timing` has **NOT fired yet** in PostHog — the owner's successful 23:09 mobile test ran on
the pre-deploy build. Needs fresh mobile wallet traffic before the data is readable.

### NEXT STEP (do this first next session)
1. `SELECT properties.device_type, avg(properties.intent_ms), max(properties.intent_ms), count()
   FROM events WHERE event='checkout_wallet_timing' GROUP BY 1`
   - mobile `intent_ms` > ~3000 → hypothesis confirmed → ship the pre-created PaymentIntent fix.
2. Check `checkout_payment_failed` grouped by `method` + `error_code` — now covers all three methods.
3. Compare `checkout_paypal_shown` → `checkout_paypal_started` → `checkout_payment_succeeded`.

## 4. Recent Changes
- 2026-08-13: **PAYPAL INSTRUMENTED + ROUTING BUG FIXED + DIAGNOSIS CORRECTED** — PayPal had zero tracking (every failure was a disappearing toast): added `checkout_paypal_shown/started/cancelled` plus `checkout_payment_failed` on createOrder, capture and SDK errors, and `checkout_payment_succeeded`. Fixed a real bug in `StripePayment.tsx`: `processing`/OXXO payments navigated to `/pago-pendiente/:id` which is NOT a route (real route is `/pending-payment/:id`) → customers hit a 404 after paying. Corrected the previous "zero mobile purchases for 4 days" claim: Aug 10–11 had ~no checkout traffic; only Aug 12 (7 views → 0 purchases) is suspicious.
- 2026-08-13: **GOOGLE PAY MOBILE DIAGNOSIS + INSTRUMENTATION** — added `checkout_wallet_timing` (`intent_ms`), `checkout_wallet_cancelled`, `checkout_wallet_load_error` so the Google Pay `CALLBACK_TIMED_OUT` becomes measurable. No fix applied yet.
- 2026-08-12: **CHECKOUT CRO PACK v1.2 SHIPPED** — `CheckoutSocialProof` rebuilt as a compact single strip; strip moved ABOVE the mobile order summary; `MobileOrderSummary` collapsed by default with a persistent `Free shipping · Arrives {date}` sub-line; sticky pay bar kept.
- 2026-08-12: **CHECKOUT CRO PACK v1.1 SHIPPED** — testimonial moved under the order summary; ratings merged into the guarantee badge; sticky mobile pay bar gated behind a payment-section sentinel; validation failure scrolls to the offending field.
- 2026-08-12: **CHECKOUT CRO PACK v1 SHIPPED** — `CheckoutSocialProof.tsx` + `payment-errors.ts`; guarantee badge + persistent decline banner; sticky mobile pay bar; desktop coupon collapsed; counts unified to 1,000+ / 127 / 4.9.
- 2026-08-12: **CRO FIXES SHIPPED** — delivery window 6–8 → 5–7 business days; PostHog `autocapture` + `rageclick`; `src/lib/checkout-tracking.ts` micro-events. Owner REJECTED: arrival date on PDP, FAQ accordion in checkout, abandonment survey.
- 2026-08-12: **CRO DIAGNOSIS** — checkout→purchase drop analyzed. Main driver upstream: ATC 6.6%→4.1%.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible white-on-white steps + STEP_TRANSLATIONS map (ES→EN).
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — dashboard filter pinned to old domain rodata-us.store.
- 2026-06-26: Tracking fixes APPLIED — PayPal trackPurchase on capture; double PageView de-dup; usd/USD fallback.
- 2026-06-24: Order Tracking page BUILT & SHIPPED — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard.
- 2026-06-18: Footer contact → support@getrodata.com
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/) — used by the PDP strip AND `CheckoutSocialProof.tsx`.

## 6. Known Issues
- **(2026-08-13) Google Pay `CALLBACK_TIMED_OUT` on mobile — NOT FIXED**, only measurable. Intermittent (owner's retry succeeded).
- **(2026-08-13) Wallet success path never fires `checkout_payment_succeeded`** — the express handler calls `trackPurchase` but not the checkout micro-event, so wallet success/failure ratio is incomplete. Card + PayPal do fire it.
- **(2026-08-13) `ProductExpressCheckout.tsx` (PDP wallet) is still hardcoded to Mexico**: `country: 'MX'`, currency fallback `'mxn'`, Spanish labels (`'Envío'`). It ALSO does create-order + create-intent inside the wallet callback → same timeout exposure. Verify the Stripe account country before touching `country`.
- **(2026-08-12) `lov-search-files` is unreliable in this repo** — returns 0 matches for strings that exist. Prefer `lov-view` with inferred paths.
- **(2026-08-12) `lov-view` with two line ranges only returns the FIRST range** — request ranges one at a time.
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout promises it.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.

## 7. Pending / Future Sessions
- **P0** Read `checkout_wallet_timing.intent_ms` by device (~24–48h of traffic) → if slow, pre-create the PaymentIntent before the wallet sheet opens.
- **P0** Check Stripe for orphan PaymentIntents / charges created after a `CALLBACK_TIMED_OUT`.
- **P0** Add `checkout_payment_succeeded` to the wallet success branch in `StripePayment.tsx`.
- **P1** Write the v1.2 entry + v1.1 "Result" line in `.lovivo/cro-log.md` (still not done).
- **P1** Investigate Aug 12 specifically (7 checkout views → 0 purchases) with session replays.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Localize `ProductExpressCheckout.tsx` to US (country/currency/labels) once Stripe account country is confirmed.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.