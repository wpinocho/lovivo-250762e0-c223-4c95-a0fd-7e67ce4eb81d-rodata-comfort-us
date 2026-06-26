# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings in English. Dates US format (date-fns default `en`, "Jun 12, 2026"). DO NOT use `es` date-fns locale.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar
- **UI kit**: shadcn (Card, Badge, Button, Skeleton, Collapsible, Input, Label). Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🔍 Tracking Audit (Meta + PostHog) — fixes pending in Craft Mode

### Diagnosis (2026-06-26) — what the PostHog data + code review revealed
Queried last 30d of `purchase` events. Findings:
- **GOOD**: deterministic `event_id` (`purchase_<order_id>`) is now working — confirmed on the 2026-06-25 order. Stripe in-page + Express Checkout + ThankYou(3DS) all route through `trackHybrid` which uses the SAME event_id for browser Pixel + CAPI + PostHog → Meta dedup correct for Stripe.
- **LEGACY NOISE**: older purchases (pre ~06-24) carry random UUID `event_id`s and a `payment_method: "payment_request_button"` value that **no longer exists anywhere in the current code** → these are from an old build, not a current bug. Explains the "inconsistent" look in PostHog.

### Confirmed CURRENT bugs to fix
1. **PayPal Purchase is never tracked client-side.**
   - `src/components/PaypalExpressButton.tsx` `onApprove` writes `completed_order` + navigates to `/thank-you/:id`, but never calls `trackPurchase`.
   - `src/pages/ThankYou.tsx` only fires the deferred Purchase when `searchParams.get('redirect_status') === 'succeeded'` (a Stripe-3DS-only param). PayPal navigation has no such param → **zero** browser Pixel / CAPI / PostHog Purchase for PayPal orders.
   - (PayPal currently disabled in settings, but this is a latent gap the moment it's re-enabled.)
2. **Double PageView on initial load (both Meta & PostHog).**
   - `PostHogContext.tsx` `loaded` callback fires `posthog.capture('$pageview')` once on init.
   - `App.tsx` `PageViewTracker` also fires `trackPageView()` on mount (and every route change), which calls `posthog.capture('$pageview')` AGAIN.
   - Likewise `PixelContext.tsx` calls `facebookPixel.pageView()` on init AND `PageViewTracker`→`trackPageView()` calls `facebookPixel.pageView()` again.
   - Net: first page load = 2 PostHog `$pageview` + 2 Meta `PageView`. Inflates counts.
3. **Wrong currency fallback for a US store.**
   - `tracking-utils.ts` `formatCurrency()` defaults to `'mxn'` and `getCurrencyFromSettings()` defaults to `'MXN'`. Should default to `'usd'` for this store (real orders pass usd explicitly so data is OK today, but the fallback is wrong).
4. **Fragile purchase de-dup guard (mixed storage).**
   - `StripePayment.tsx` uses `sessionStorage['purchase_tracked_<orderId>']`; `ThankYou.tsx` uses `localStorage['purchase_tracked_<orderId>']`. Different stores → they don't cross-block. Today they cover disjoint paths so no double-fire, but unify to ONE storage + key to be safe.

### Implementation steps (Craft Mode)
1. **PayPal Purchase fix** — in `PaypalExpressButton.tsx` `onApprove`, after a confirmed `COMPLETED` capture and before/after navigate, call `trackPurchase({ products: items→createTrackingProduct, value: amount, currency, order_id: internalOrderId||data.orderID, custom_parameters:{ payment_method:'paypal' } })`. Guard with the SAME unified key used elsewhere so ThankYou won't re-fire. Import `trackPurchase, tracking` from `@/lib/tracking-utils`.
2. **Pageview de-dup** — pick ONE source of truth. Recommended: remove the manual `$pageview` from the `PostHogContext` `loaded` callback AND the `facebookPixel.pageView()` from `PixelContext` init, and let `PageViewTracker` (App.tsx) be the single place that fires both on mount + route change. Verify `trackPageView()` includes `$current_url`/`$pathname` props on the PostHog capture for parity.
3. **Currency fallback** — change `formatCurrency` default and `getCurrencyFromSettings` default from mxn/MXN to usd/USD (or better, read from SettingsContext currency).
4. **Unify purchase guard** — standardize on `sessionStorage['purchase_tracked_<orderId>']` (survives same-tab redirects) across StripePayment, ThankYou, and the new PayPal call.
5. **Verify, don't assume, server-side CAPI** — the client already sends both browser Pixel + CAPI with one event_id. If the BACKEND (payments webhook) ALSO emits a Purchase to Meta with a different id, that double-counts. This is a backend/Meta check, not a frontend change (see Known Issues — expired CAPI token).

### Files to modify
- `src/components/PaypalExpressButton.tsx` — fire `trackPurchase` on successful capture.
- `src/contexts/PostHogContext.tsx` — remove duplicate manual `$pageview` (let PageViewTracker own it).
- `src/contexts/PixelContext.tsx` — remove duplicate `facebookPixel.pageView()` on init.
- `src/lib/tracking-utils.ts` — usd/USD currency defaults; ensure trackPageView passes url props; confirm single guard key.
- `src/pages/ThankYou.tsx` — align guard to sessionStorage; keep 3DS deferred-purchase path.

## 4. Recent Changes
- 2026-06-26: **Tracking audit (Meta + PostHog)** — Queried 30d purchase events. Confirmed deterministic event_id now works (06-25). Found CURRENT bugs: (1) PayPal purchases never tracked client-side, (2) double PageView on initial load (PostHog + Meta), (3) mxn currency fallback wrong for US store, (4) mixed sessionStorage/localStorage purchase guard. Legacy random-UUID + `payment_request_button` purchases are old-build noise, not a live bug. Plan saved for Craft Mode.
- 2026-06-24: **Order Tracking page BUILT & SHIPPED** — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links, MyOrders EN + Track CTA, ThankYou "Track my order".
- 2026-06-18: **Meta duplicate conversions fix** — deterministic event_id + sessionStorage guard on 3 trackPurchase sites
- 2026-06-18: **Footer contact** — WhatsApp → `support@getrodata.com`
- 2026-06-15: **Attribution fix** — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal
- 2026-06-10: **PaypalExpressButton.tsx** — fallbackOrder; localStorage always written
- 2026-06-10: **CheckoutUI.tsx** — single PayPal instance; mobile PayPal above Stripe
- 2026-06-09: **Delivery window** — 6–8 business days in CheckoutUI + ProductPageUI

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/)

## 6. Known Issues
- **META DIAGNÓSTICO 🔴2**: Likely expired CAPI Access Token — fix in Meta Business Manager (manual). This could mean server CAPI Purchase events are silently failing even when the client fires them correctly.
- **PayPal Purchase not tracked client-side** (see Active Plan) — latent until PayPal re-enabled, but fix anyway.
- **Double PageView on initial load** — PostHog + Meta inflated (see Active Plan).
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard

## 7. Pending / Future Sessions
- **Apply the 5 tracking fixes above in Craft Mode** (PayPal purchase, pageview de-dup, currency fallback, unified guard, verify server CAPI).
- Fix expired CAPI Access Token in Meta Business Manager (manual — no code change)
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay
- (Order tracking) Verify `order-track` edge returns expected shape once a real order ships