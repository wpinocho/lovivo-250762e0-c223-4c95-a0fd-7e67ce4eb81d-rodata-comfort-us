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

## 3. Active Plan — ✅ Tracking fixes APPLIED (2026-06-26)

All 4 confirmed frontend tracking bugs are now fixed in code:
1. **PayPal Purchase** — `PaypalExpressButton.tsx` `onApprove` now fires `trackPurchase` (browser Pixel + CAPI + PostHog) after a confirmed COMPLETED capture, with `payment_method: 'paypal'`. Guarded by the unified `sessionStorage['purchase_tracked_<orderId>']` key.
2. **Double PageView de-dup** — chose the ROBUST approach (NOT the "PageViewTracker owns all" idea from the old plan, which had a load-timing race that could DROP the initial pageview):
   - INITIAL pageview fires ONCE from the providers: PostHog `loaded` callback (already had `$current_url`/`$pathname`) + Pixel init.
   - `PixelContext` init effect now uses a `pixelInitedRef` so `facebookPixel.pageView()` fires exactly once (was re-firing on every fbp/fbc change). `setPixelData` moved to its own effect (no pageView).
   - `App.tsx` `PageViewTracker` now SKIPS the first render (`isFirstRender` ref) and owns only SPA navigations.
   - `trackPageView()` PostHog capture now includes `$current_url`/`$pathname` for parity.
3. **Currency fallback** — `tracking-utils.ts` `formatCurrency` default mxn→usd; `getCurrencyFromSettings` default MXN→USD.
4. **Unified purchase guard** — `ThankYou.tsx` switched from localStorage→`sessionStorage['purchase_tracked_<orderId>']`, matching StripePayment (in-page + Express) and the new PayPal call. One key, one store, cross-blocks all redirect flows.

### Still NOT verifiable from frontend (manual / backend)
- **Server-side CAPI**: client sends browser Pixel + CAPI with ONE event_id (dedup correct). If the payments webhook ALSO emits Purchase to Meta with a different id → double count. Check in Meta Business Manager.
- **Expired CAPI Access Token** (Meta 🔴 diagnostic) — fix in Meta Business Manager. Server events may be silently rejected even when client fires correctly.

## 4. Recent Changes
- 2026-06-26: **Tracking fixes APPLIED (Craft Mode)** — (1) PayPal now fires trackPurchase on capture, (2) double PageView removed via provider-owns-initial + PageViewTracker-skips-first-mount + PixelContext pageView-once ref, (3) usd/USD currency fallback, (4) ThankYou guard unified to sessionStorage. Files: PaypalExpressButton.tsx, tracking-utils.ts, App.tsx, PixelContext.tsx, ThankYou.tsx.
- 2026-06-26: **Tracking audit (Meta + PostHog)** — Queried 30d purchase events. Confirmed deterministic event_id works (06-25). Legacy random-UUID + `payment_request_button` purchases are old-build noise, not a live bug.
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
- **META DIAGNÓSTICO 🔴2**: Likely expired CAPI Access Token — fix in Meta Business Manager (manual). Server CAPI Purchase events may be silently failing even when client fires correctly.
- **Verify server-side CAPI dedup**: confirm payments webhook does NOT emit a second Purchase with a different event_id (would double-count). Backend/Meta check.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard

## 7. Pending / Future Sessions
- Verify in Meta Events Manager that PageView counts halved and PayPal purchases register (once PayPal re-enabled).
- Fix expired CAPI Access Token in Meta Business Manager (manual — no code change)
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay
- (Order tracking) Verify `order-track` edge returns expected shape once a real order ships