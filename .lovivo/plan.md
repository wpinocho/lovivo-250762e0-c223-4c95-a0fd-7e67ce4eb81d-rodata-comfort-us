# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — loaded from Google Fonts (async/non-blocking)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar

## 3. Active Plan
### ✅ Meta Duplicate Conversions Fix — IMPLEMENTED (2026-06-18)

**Root cause confirmed & fixed:** `generateEventId()` called `crypto.randomUUID()` on every invocation. Two-part fix applied:

**Part 1 — Deterministic event_id in `src/lib/tracking-utils.ts` ✅**
- `generateEventId(eventName, stableId?)` — returns `${eventName}_${stableId}` when stableId provided, random UUID otherwise
- `trackHybrid()` — accepts optional `stableId?` param, passes to `generateEventId`
- All call sites updated: ViewContent → product_id, AddToCart → product_id, InitiateCheckout → order_id || product_id, Purchase → order_id, Search → search_string.trim().toLowerCase()
- PageView intentionally NOT touched (each page view should count)

**Part 2 — sessionStorage dedup guard ✅**
- `StripePayment.tsx` — both `trackPurchase` calls wrapped (normal card payment + Express Checkout)
- `ProductExpressCheckout.tsx` — `trackPurchase` call wrapped
- Pattern: `const ptKey = \`purchase_tracked_${orderId}\`` — try/catch ensures safe fallback

---

## 4. Recent Changes
- 2026-06-18: **Meta duplicate conversions fix IMPLEMENTED** — deterministic event_id + sessionStorage guard on all 3 trackPurchase call sites
- 2026-06-18: **Footer contact** — WhatsApp replaced with `support@getrodata.com` email link
- 2026-06-15: **Attribution fix IMPLEMENTED** — all 5 files patched, fbclid/fbc/fbp/UTMs now flow to checkout-create and PayPal edge calls
- 2026-06-15: **Attribution bug diagnosed** — checkout.ts and PaypalExpressButton send ZERO attribution; getAttributionPayload() doesn't exist; raw fbclid/UTMs not in localStorage
- 2026-06-10: **PaypalExpressButton.tsx** — Fixed ThankYou "Order Not Found": added `fallbackOrder` built from props; localStorage now always written via `res.order ?? fallbackOrder`
- 2026-06-10: **ThankYou page** — "Order Not Found" bug identified: res.order is null from paypal-capture-order, localStorage never written
- 2026-06-10: **PaypalExpressButton.tsx** — Removed validation gate; fixed `paypal_order_id` param; improved `onApprove` error handling + `res.order?.id || res.order_id` fallback
- 2026-06-10: **CheckoutUI.tsx** — Replaced dual mobile/desktop PayPal instances with single instance (no responsive class needed)
- 2026-06-10: **CheckoutUI.tsx** — Removed "or pay with card" divider text on desktop; added mobile PayPal (`md:hidden`) above StripePayment
- 2026-06-10: **PaypalExpressButton.tsx + CheckoutUI.tsx** — PayPal repositioned: mobile=above form (after summary), desktop=above GPay/Link (before StripePayment)
- 2026-06-10: **PayPal integration** — SettingsContext (RPC query), PaypalExpressButton.tsx (new), CheckoutUI.tsx (mounted after StripePayment)
- 2026-06-09: **CheckoutUI.tsx + ProductPageUI.tsx** — Delivery window changed to 6–8 business days (was 7–9)
- 2026-06-09: **StripePayment.tsx** — Removed duplicate "30-Day Comfort Guarantee" line above buy button

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `render/image/public/message-images/0f3c776b.../1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `render/image/public/message-images/0f3c776b.../1775768374485-uca4dkx21g.webp?width=1200&quality=75`
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/ repo)

## 6. Known Issues
- **META DIAGNÓSTICO 🔴2**: Likely an expired CAPI Access Token — fix in Meta Business Manager (manual action needed)
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label misleading
- Product slug still in Spanish — may want English slug redirect
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard > Settings > Payment methods

## 7. Key Files
- `src/lib/tracking-utils.ts` ✅ — deterministic event_id fix DONE; getAttributionPayload() exported
- `src/contexts/PixelContext.tsx` ✅ — first-touch fbclid/UTMs/landing_site/referrer persisted
- `src/lib/checkout.ts` ✅ — attribution param in createCheckoutFromCart
- `src/hooks/useCheckout.ts` ✅ — attribution passed to createCheckoutFromCart (both checkout paths)
- `src/components/PaypalExpressButton.tsx` ✅ — attribution in paypal-create-order + paypal-capture-order
- `src/lib/supabase.ts` ✅ — CheckoutPayload.attribution field added
- `src/contexts/SettingsContext.tsx` — Exposes paypalEnabled/paypalClientId/paypalEnvironment via RPC
- `src/pages/ui/CheckoutUI.tsx` — Single PayPal instance above StripePayment
- `src/pages/ui/IndexUI.tsx` — Prices dynamically linked to product DB
- `src/components/StripePayment.tsx` ✅ — Full EN + trust signals + pre-pay rating; sessionStorage dedup guard on both trackPurchase call sites
- `src/pages/ThankYou.tsx` — Reads from localStorage (no change needed)
- `src/pages/ui/ProductPageUI.tsx` — English + US reviews + Launch Offer + Shipping accordion
- `src/components/ProductExpressCheckout.tsx` ✅ — sessionStorage dedup guard on trackPurchase

## 8. Pending / Future Sessions
- Fix expired CAPI Access Token in Meta Business Manager (manual — no code change)
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay