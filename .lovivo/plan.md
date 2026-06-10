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
### 🔧 Fix ThankYou "Order Not Found" after PayPal payment

**Root cause**: `paypal-capture-order` edge function returns `ok: true` and `order_id` but `res.order` is null/undefined. The `PaypalExpressButton` only does `localStorage.setItem('completed_order', ...)` when `res.order` is truthy — so nothing gets saved. ThankYou page reads only from localStorage → shows "Order Not Found".

**Fix — `src/components/PaypalExpressButton.tsx`**:
Build a fallback order object from the props we already have (`items`, `amount`, `currency`) so localStorage always gets written:

```js
// After capture succeeds:
const orderFromServer = res.order
const internalOrderId = res.order?.id || res.order_id

// Build fallback from props in case res.order is null
const fallbackOrder = {
  id: internalOrderId || data.orderID,
  order_number: (internalOrderId || data.orderID).slice(0, 8).toUpperCase(),
  total_amount: amount,
  currency_code: currency.toUpperCase(),
  status: 'paid',
  order_items: items.map(it => ({
    product_name: it.title || it.product_name || 'Product',
    quantity: it.quantity,
    price: it.unit_price || it.price || 0,
    product_images: it.images || it.product_images || [],
    variant_name: it.variant_title || it.variant_name || null,
  })),
  created_at: new Date().toISOString(),
}

localStorage.setItem('completed_order', JSON.stringify(orderFromServer || fallbackOrder))
const ordId = internalOrderId || data.orderID
navigate(`/thank-you/${ordId}`)
```

**No changes needed to ThankYou.tsx** — it already renders correctly once localStorage has data.

## 4. Recent Changes
- 2026-06-10: **ThankYou page** — "Order Not Found" bug identified: res.order is null from paypal-capture-order, localStorage never written → pending fix
- 2026-06-10: **PaypalExpressButton.tsx** — Removed validation gate; fixed `paypal_order_id` param; improved `onApprove` error handling + `res.order?.id || res.order_id` fallback
- 2026-06-10: **CheckoutUI.tsx** — Replaced dual mobile/desktop PayPal instances with single instance (no responsive class needed)
- 2026-06-10: **CheckoutUI.tsx** — Removed "or pay with card" divider text on desktop; added mobile PayPal (`md:hidden`) above StripePayment
- 2026-06-10: **PaypalExpressButton.tsx + CheckoutUI.tsx** — PayPal repositioned: mobile=above form (after summary), desktop=above GPay/Link (before StripePayment)
- 2026-06-10: **PaypalExpressButton.tsx** — Added `className` + `showDivider` props
- 2026-06-10: **PaypalExpressButton.tsx** — Fixed: replaced invalid `@paypal/react-paypal-js/sdk-v6` import with standard `PayPalScriptProvider` + `PayPalButtons` from `@paypal/react-paypal-js`
- 2026-06-10: **CheckoutUI.tsx** — Added missing `import { PaypalExpressButton }` (was causing ReferenceError + blank page)
- 2026-06-10: **PayPal integration** — SettingsContext (RPC query), PaypalExpressButton.tsx (new), CheckoutUI.tsx (mounted after StripePayment)
- 2026-06-10: **CheckoutUI.tsx** — Shipping shows "FREE" (was "Pending") when shippingCost === 0 on mobile
- 2026-06-09: **CheckoutUI.tsx + ProductPageUI.tsx** — Delivery window changed to 6–8 business days (was 7–9)
- 2026-06-09: **StripePayment.tsx** — Removed duplicate "30-Day Comfort Guarantee" line above buy button
- 2026-06-09: **CheckoutUI.tsx** — Added `getEstimatedDelivery()` fn + "Free shipping · Arrives [date]" line
- 2026-06-09: **CheckoutUI.tsx** — Mobile order summary now open by default
- 2026-06-09: **StripePayment.tsx** — Added pre-pay trust block ABOVE "Complete Purchase" button

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `render/image/public/message-images/0f3c776b.../1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `render/image/public/message-images/0f3c776b.../1775768374485-uca4dkx21g.webp?width=1200&quality=75`
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/ repo)

## 6. Known Issues
- **META DIAGNÓSTICO 🔴1**: Likely an expired CAPI Access Token — fix in Meta Business Manager
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label misleading
- Product slug still in Spanish — may want English slug redirect
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard > Settings > Payment methods

## 7. Key Files
- `src/contexts/SettingsContext.tsx` — ✅ Exposes paypalEnabled/paypalClientId/paypalEnvironment via RPC
- `src/components/PaypalExpressButton.tsx` — 🔧 Needs fallback order object in onApprove
- `src/pages/ui/CheckoutUI.tsx` — ✅ Single PayPal instance above StripePayment
- `src/pages/ui/IndexUI.tsx` — ✅ Prices dynamically linked to product DB
- `src/contexts/PixelContext.tsx` — ✅ fbclid persisted to localStorage + first-party cookie
- `src/lib/tracking-utils.ts` — ✅ CAPI reads localStorage fallback for fbc/fbp
- `src/components/StripePayment.tsx` — ✅ Full EN + trust signals + pre-pay rating
- `src/pages/ThankYou.tsx` — ✅ Reads from localStorage (no change needed)
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + Launch Offer + Shipping accordion

## 8. Pending / Future Sessions
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay