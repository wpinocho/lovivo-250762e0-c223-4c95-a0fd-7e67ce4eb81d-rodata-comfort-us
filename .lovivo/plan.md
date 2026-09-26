# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt ($59 USD, compare-at $75/$79)
- **Landed cost**: **$10 USD/unit** (owner-confirmed 2026-09-04) → ~83% gross margin. Huge room for AOV levers.
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
  - Owner has a good eye for visual density — avoid stacking multiple cards in a row. Prefers compact single-strip social proof over tall testimonial cards.
  - Owner asks for RESEARCH before UX pattern changes — cite sources, don't assert.
  - Owner wants clear separation between "diagnosed" and "fixed" — never imply a fix shipped when only measurement shipped.
  - **(2026-09-04) AOV levers must NOT dominate the PDP.** Any upsell must keep 1 unit as the default and stay visually quiet.
  - **(2026-09-04) Offer framing: show the SECOND-unit price, not the blended per-unit price.**
  - **(2026-09-04) No "free exchange" promise in the 2-pack microcopy.**
  - **(2026-09-26) Owner is technical on tracking**: wants small, auditable fixes, tests, and an explicit diff summary. Do NOT filter Meta events by traffic source — all sources go to Meta on purpose.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **`text-brand-steel` at ≤11px on dark is TOO DIM for selling copy** — use `text-brand-smoke`.
- **Badge emphasis ladder**: quiet = `bg-brand-amber/15 border-brand-amber/30 text-brand-amber`; loud = solid `bg-brand-amber text-brand-carbon`.
- **Avatar rings inside a `bg-brand-graphite` card must use `border-brand-graphite`**.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🟢 Meta event_id fix staged (2026-09-26) · 🟠 Google Pay timeout still open

### A. META EVENT_ID LIFECYCLE — FIXED 2026-09-26 (tests written, NOT executed by agent)
**Rule**: event_id = unique per REAL occurrence; Pixel + CAPI + PostHog share it within that one call (`trackHybrid` generates it once and passes the same string to all three sinks).
- `stableId` is ONLY allowed for a key that identifies one business occurrence: **Purchase → order_id** (unchanged), **InitiateCheckout → order_id if present** (no product fallback).
- ViewContent, AddToCart, Search, CustomEvent → always random UUID.
- Before the fix, `CheckoutAdapter.tsx:173` never passes `order_id`, so every InitiateCheckout in production was `initiatecheckout_<product_id>` — one ID shared by the whole store. ViewContent/AddToCart were `<event>_<product_id>`, Search `search_<query>`. Meta was likely dropping most of these as duplicates → expect ViewContent/ATC/IC counts in Events Manager to JUMP after deploy (that's the real volume, not a tracking spike).
- Tests: `src/lib/tracking-utils.test.ts` (cases A–H). Agent has no shell → owner must run `npm test` + `npx tsc --noEmit -p tsconfig.app.json`.
- **No Google Ads integration exists in the repo** (no gtag in src/ or index.html).

### B. 2-PACK / BOGO — SHIPPED 2026-09-04
**Offer**: 2 belts = **$88.50** = first at $59 + **second at $29.50 (50% off)**. `volume` price rule `d30f69a4-b188-4f14-b4e6-8202d81e5d51`, 25% off every unit at qty ≥ 2, scoped to product `6a3f41ac-37f6-4886-85f0-01cf0c6238ed`. **Do not exceed 50% off the second unit.**
- UI: `src/components/ProductPackSelector.tsx` (1 pre-selected). Git log shows later commit "Two-belt pack: independent sizes per belt across every buy path" + payment verification commits — re-read those files before touching pack logic.

### C. Google Pay CALLBACK_TIMED_OUT — NOT FIXED, only instrumented
- Remedy PENDING: pre-create the PaymentIntent before the wallet sheet opens, cache `client_secret`.

## 4. Recent Changes
- 2026-09-26: **META EVENT_ID DEDUP FIX** — `tracking-utils.ts`: ViewContent/AddToCart no longer pass product_id as stableId; InitiateCheckout uses only `params.order_id` (no product fallback); Search uses a random UUID instead of the query. Purchase untouched. Rewrote the `generateEventId` comment to forbid shared keys. New `src/lib/tracking-utils.test.ts` covers cases A–H. fbp/fbc, user_data, PostHog payloads, pixel init untouched.
- 2026-09-04: **2-PACK OFFER FRAMING v2** — solid-amber `2nd belt 50% off` badge, `First $59 · second only $29.50`, struck `$118` over `$88.50`. Dropped "Free exchange," from mixed-size microcopy.
- 2026-09-04: **2-PACK AOV LEVER SHIPPED** — volume price rule + `ProductPackSelector.tsx`; `ProductExpressCheckout` gets effective unit price (prevented $118 overcharge).
- 2026-08-13: **PAYPAL INSTRUMENTED + ROUTING BUG FIXED** — `/pago-pendiente/:id` → `/pending-payment/:id`.
- 2026-08-13: **GOOGLE PAY MOBILE DIAGNOSIS + INSTRUMENTATION** — no fix applied.
- 2026-08-12: **CHECKOUT CRO PACK v1.2** — compact social-proof strip; `MobileOrderSummary` collapsed.
- 2026-08-12: **CHECKOUT CRO PACK v1.1** — testimonial, guarantee badge, sticky bar gating.
- 2026-08-12: **CHECKOUT CRO PACK v1** — `CheckoutSocialProof.tsx` + `payment-errors.ts`.
- 2026-08-12: **CRO FIXES** — delivery window 5–7 business days; PostHog autocapture; `checkout-tracking.ts`.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible steps + STEP_TRANSLATIONS.
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — filter pinned to old domain.
- 2026-06-26: Tracking fixes — PayPal trackPurchase on capture; PageView de-dup; usd fallback.
- 2026-06-24: Order Tracking page BUILT & SHIPPED.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard. (⚠️ over-applied stableIds to non-idempotent events; corrected 2026-09-26.)
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal.

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/)
- Product images (6): `product-images/products/{ikd1slcjslh,kq3m6oa30qp,4ui0bi0f6nt,0aesq7u46qs4,b5mg4lv2qbf,2l8h0ww9eb5}.webp`

## 6. Known Issues
- **(2026-09-26) Agent cannot run vitest/tsc** (no shell tool). Tests in `src/lib/*.test.ts` must be run by the owner/CI.
- **(2026-09-26) `CheckoutAdapter.tsx` InitiateCheckout never passes `order_id`** → IC is now a fresh UUID per checkout mount (guarded by `hasTrackedCheckout` ref). Passing the real order id there would give reload-dedupe; not done (out of scope).
- **(2026-09-04) `bogo` rule type likely BROKEN** (`same_products` vs `same_product`). Use `volume`.
- **(2026-09-04) Wallet + PayPal 2-unit charge UNVERIFIED** (card confirmed $88.50).
- **(2026-09-04) `price-rule-utils.ts` has Spanish labels** in graduated-volume and bogo paths.
- **(2026-08-13) Google Pay `CALLBACK_TIMED_OUT` on mobile — NOT FIXED.**
- **(2026-08-13) Wallet success path never fires `checkout_payment_succeeded`.**
- **(2026-08-13) `ProductExpressCheckout.tsx` hardcoded to Mexico** (`country: 'MX'`, `'mxn'`, `'Envío'`).
- **(2026-08-12) `lov-search-files` glob with `{a,b}` braces returns 0 matches** — use separate searches.
- **(2026-08-12) `lov-view` with two line ranges only returns the FIRST range.**
- **(2026-08-12) PayPal settings race** — `enabled: false | clientId: null` logs before RPC resolves.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26).
- Backend tracking steps come in Spanish — translated client-side in OrderTrackUI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text.
- PDP logic lives in `src/components/headless/HeadlessProduct.tsx`, not `ProductAdapter.tsx`.

## 7. Pending / Future Sessions
- **P0** Owner: run `npm test` + typecheck for `tracking-utils.test.ts`; after deploy, check Meta Events Manager → ViewContent/ATC/IC dedup rate and Event Match Quality.
- **P0** Confirm 2-unit charge is **$88.50** on wallet AND PayPal.
- **P0** Read `checkout_wallet_timing.intent_ms` by device → pre-create PaymentIntent if slow.
- **P0** Add `checkout_payment_succeeded` to wallet success branch in `StripePayment.tsx`.
- **P1** Optional: pass the real checkout `order_id` into `trackInitiateCheckout` in `CheckoutAdapter.tsx`.
- **P1** Measure 2-pack attach rate + AOV before/after 2026-09-04.
- **P1** Log recent changes in `.lovivo/cro-log.md`.
- **P1** Investigate Aug 12 (7 checkout views → 0 purchases).
- **P2** Localize `ProductExpressCheckout.tsx` to US.
- **P2** Replace feature images with English versions.
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing accordion in checkout, abandonment survey, "free exchange" wording, filtering Meta events by traffic source.