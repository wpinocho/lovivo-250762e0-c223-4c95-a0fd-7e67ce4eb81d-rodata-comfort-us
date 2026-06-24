# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings are in English (ThankYou, MyOrders, etc.). Any new UI strings MUST be in English. Dates in US format (date-fns default `en`, e.g. "Jun 12, 2026"). DO NOT use the `es` date-fns locale on new pages.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — loaded from Google Fonts (async/non-blocking)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar
- **UI kit**: shadcn (Card, Badge, Button, Skeleton, Collapsible). Wrap pages in `EcommerceTemplate`.

## 3. Active Plan
### 🚧 Order Tracking Page — TO BUILD (Craft Mode)

**Goal:** Public, branded order-tracking page (Shopify-style timeline) so customers can self-serve "where is my order?". Backend is DONE — edge function `order-track` is deployed and public (no auth). Only the storefront frontend is missing.

**Edge function contract (already deployed):**
- `callEdge('order-track', { token })` — token mode (from email links)
- `callEdge('order-track', { store_id: STORE_ID, order_number, email })` — lookup mode (no link)
- Returns: `steps[]` (4 steps), `current_step`, `cancelled` (bool), `carrier`/`shipping_carrier`, `tracking_number`, `tracking_url`, `estimated_delivery_at`, `events[]` (occurred_at + status_detail + location), `display_mode` ('detailed' | 'masked').
- Use the existing helper `callEdge` from `src/lib/edge.ts`. It already has invoke + direct-fetch fallback. No auth needed.
- Email links point to `https://{domain}/orders/track/{checkout_token}` → route MUST be `/orders/track/:token` (NOT a Spanish path).

**Implementation steps:**

1. **Create `src/pages/OrderTrack.tsx` (Tipo A wrapper)**
   - Reads `:token` from URL via `useParams`.
   - Adds `noindex` (transactional/per-customer page). Project has NO react-helmet — add a small `useEffect` that injects `<meta name="robots" content="noindex,nofollow">` into `document.head` on mount and removes it on unmount.
   - Renders `<OrderTrackUI token={token} />`.

2. **Create `src/pages/ui/OrderTrackUI.tsx` (Tipo B, editable)**
   - Wrap in `<EcommerceTemplate layout="centered">` for visual consistency with MyOrders.
   - Two modes:
     - **Token mode** (`token` prop present): on mount call `callEdge('order-track', { token })`.
     - **Lookup mode** (no token): render a form with `order_number` + `email`; on submit call `callEdge('order-track', { store_id: STORE_ID, order_number, email })`. Import `STORE_ID` from `@/lib/config`.
   - **Timeline UI (Shopify-style):** horizontal/vertical stepper from `steps[]`; `current_step` drives filled (✓) / active (●) / pending (○) states. Use brand-amber for completed/active.
   - **Cancelled banner:** if `cancelled === true`, show a red banner "Order canceled" and de-emphasize the timeline.
   - **Estimated delivery block:** highlighted card with `estimated_delivery_at` formatted `format(date, 'MMM d, yyyy')` (English/US, no `es` locale).
   - **Carrier block (only if `display_mode === 'detailed'`):** carrier name, copyable `tracking_number` (copy-to-clipboard + toast), and a "Track with carrier" button → `tracking_url` (opens in new tab).
   - **Events list (`events[]`):** collapsible (use Collapsible) showing `occurred_at` + `status_detail` + `location`.
   - **Masked mode (`display_mode === 'masked'`):** hide carrier/tracking/events; show only timeline + estimated delivery (white-label).
   - **States:** loading skeleton (reuse Skeleton like MyOrders OrderSkeleton), 404 ("We couldn't find your order"), generic error with retry.
   - **All copy in ENGLISH.**

3. **Register routes in `src/App.tsx`**
   - `const OrderTrack = lazy(() => import('./pages/OrderTrack'));`
   - `<Route path="/orders/track" element={<OrderTrack />} />`
   - `<Route path="/orders/track/:token" element={<OrderTrack />} />`
   - Place near the other lazy routes. KEEP `/orders/track` (English) — that's the URL Lovivo builds in emails.

4. **Connect `src/pages/ui/MyOrdersUI.tsx` → tracking page**
   - Inside `OrderCard`'s expanded `CollapsibleContent`, after the shipping address block:
     - If `order.checkout_token` exists → primary Button "Track order" → `navigate('/orders/track/' + order.checkout_token)`.
     - If `order.tracking_number` exists → secondary chip with the number; if `order.tracking_url`, external link "View with carrier".
     - If `order.estimated_delivery_at` exists → line "Estimated delivery: {format(date, 'MMM d, yyyy')}".
   - All copy in ENGLISH. `useNavigate` already imported.

5. **`src/adapters/MyOrdersAdapter.tsx` — verify select fields**
   - NOTE: adapter queries the `orders_customer` VIEW with `select('*')`, so all columns the view exposes already come through (no explicit field list to extend). 
   - ACTION: confirm the `orders_customer` view exposes `checkout_token`, `tracking_number`, `tracking_url`, `shipping_carrier`, `estimated_delivery_at`, `shipped_at`, `paid_at`. If the view omits any, that's a backend/view change (not done here) — fall back gracefully (hide the CTA if `checkout_token` is missing). Do NOT break the existing `select('*')`.
   - This file is Tipo C (forbidden adapter) — only touch if a select change is truly required; prefer not editing it.

6. **`src/pages/ThankYou.tsx` (optional but recommended)**
   - Add a "Track my order" CTA (links to `/orders/track/{checkout_token}`) in the Action Buttons row when a checkout_token is available.
   - CAVEAT: ThankYou reads the order from `localStorage('completed_order')` and its `OrderDetails` interface does NOT include `checkout_token`. Before wiring this, confirm `completed_order` payload includes `checkout_token` (check what StripePayment/PaypalExpressButton write). If the token isn't present, skip this CTA for now rather than render a broken link.

**Files to create/modify:**
- CREATE `src/pages/OrderTrack.tsx` (wrapper + noindex)
- CREATE `src/pages/ui/OrderTrackUI.tsx` (timeline UI, both modes, English)
- EDIT `src/App.tsx` (two lazy routes)
- EDIT `src/pages/ui/MyOrdersUI.tsx` ("Track order" CTA + tracking chip + estimated delivery, English)
- VERIFY `src/adapters/MyOrdersAdapter.tsx` (orders_customer view exposes tracking fields; uses `select('*')`)
- EDIT (optional) `src/pages/ThankYou.tsx` ("Track my order" CTA, only if checkout_token is in completed_order)

**Deviations from the pasted plan (because this is the US/English store):**
- Routes stay `/orders/track` (already English — matches emails). NO `/pedidos/rastrear`.
- Orders page route is `/my-orders` (not `/mis-pedidos`).
- ALL strings in ENGLISH; date-fns default `en` locale (not `es`).
- Adapter uses `select('*')` on a view, so no explicit field list — just verify the view.

**End-to-end verification (after build):**
- Generate a shipping label in dashboard → confirm `order_shipped` email arrives with `https://{domain}/orders/track/{token}`.
- Open the link → timeline at "Shipped", carrier, tracking, estimated delivery.
- Simulate carrier webhook → reload → new events + step advance.
- Logged-in `/my-orders` → card shows "Track order" + estimated delivery.
- `/orders/track` without token + order_number + email → lookup works.
- Set `store_settings.tracking_display_mode = 'masked'` → reload → carrier/tracking/events hidden.

## 4. Recent Changes
- 2026-06-24: **Order Tracking page PLANNED** — public timeline page (`/orders/track/:token` + lookup), MyOrders CTA, optional ThankYou CTA. Adapted to English/US. Ready for Craft Mode.
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
- **Order tracking**: must confirm `orders_customer` view exposes tracking fields; must confirm `completed_order` localStorage payload includes `checkout_token` before adding ThankYou CTA. No react-helmet → noindex via manual document.head meta injection.

## 7. Key Files
- `src/lib/edge.ts` — `callEdge(fn, body)` helper (invoke + direct-fetch fallback, no auth needed) — used by OrderTrack
- `src/lib/config.ts` — exports `STORE_ID` (needed for lookup mode)
- `src/pages/OrderTrack.tsx` 🚧 — TO CREATE (wrapper + noindex)
- `src/pages/ui/OrderTrackUI.tsx` 🚧 — TO CREATE (timeline UI, English)
- `src/App.tsx` 🚧 — add `/orders/track` + `/orders/track/:token` lazy routes
- `src/pages/ui/MyOrdersUI.tsx` 🚧 — add "Track order" CTA (English); uses `order: any`, `useNavigate` already imported
- `src/adapters/MyOrdersAdapter.tsx` — Tipo C; queries `orders_customer` view with `select('*')`; verify tracking fields exposed
- `src/pages/ThankYou.tsx` 🚧 — optional "Track my order" CTA (verify checkout_token in completed_order)
- `src/templates/EcommerceTemplate.tsx` — layout wrapper; `pageTitle` renders an h1; no Helmet
- `src/lib/tracking-utils.ts` ✅ — deterministic event_id fix DONE
- `src/contexts/PixelContext.tsx` ✅ — first-touch attribution persisted
- `src/lib/checkout.ts` ✅ — attribution param
- `src/components/StripePayment.tsx` ✅ — sessionStorage dedup guard
- `src/components/ProductExpressCheckout.tsx` ✅ — sessionStorage dedup guard

## 8. Pending / Future Sessions
- Build Order Tracking page (this plan) — HIGH priority
- Fix expired CAPI Access Token in Meta Business Manager (manual — no code change)
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay