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
### 🔴 Attribution Bug — fbclid / fbc NOT being sent to checkout or PayPal

**Diagnosed 2026-06-15**

### Root Cause (3 bugs found)

**Bug 1 — checkout.ts sends ZERO attribution**
`createCheckoutFromCart()` builds its payload with NO attribution fields. The function described in the flow (`getAttributionPayload()`) does NOT exist in the codebase. There is no `src/lib/attribution.ts`. So `checkout-create` never receives `fbclid`, `fbc`, `fbp`, or UTMs.

**Bug 2 — PaypalExpressButton.tsx sends ZERO attribution**
Neither `paypal-create-order` nor `paypal-capture-order` receive attribution data. The PayPal flow is completely untracked from an attribution standpoint.

**Bug 3 — Raw fbclid and UTMs not persisted to localStorage**
`PixelContext.tsx` correctly builds `_fbc = fb.1.<ts>.<fbclid>` and stores as `_fbc_fallback` in localStorage. But:
- The raw `fbclid` value itself is NOT saved separately to localStorage
- UTM params (utm_source, utm_medium, utm_campaign, utm_content, utm_term) are NOT saved anywhere
- landing_site (original URL with query params) is NOT saved
- There's no per-route-change capture of UTMs (no App.tsx `captureAttributionFromCurrentUrl`)

**What DOES work:**
- `PixelContext` saves `_fbc_fallback` → localStorage ✅
- `tracking-utils.ts` `getUserDataForCapi()` reads `_fbc_fallback` from localStorage ✅
- So ViewContent / AddToCart / InitiateCheckout CAPI events DO get fbc (if PixelContext ran first) ✅

**PostHog observation (session 019ec0b9):**
- User landed with fbclid → product page → added to cart → /pagar → /thank-you (purchased!)
- ALL PostHog events have `fbc: null, fbp: null` — this is expected because fbc/fbp are only in CAPI user_data, NOT in PostHog customData properties
- The fbclid field IS correctly captured in the URL by PostHog auto-capture
- Session went to /pagar (old route) — confirms routing is working

---

### Fix Plan

#### Step 1 — Add `getAttributionData()` utility to `src/lib/tracking-utils.ts`
Add a public method `getAttributionPayload()` to the TrackingUtility class (or as a standalone export):

```ts
export function getAttributionPayload(): Record<string, string | null> {
  const ls = typeof localStorage !== 'undefined' ? localStorage : null;
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  const fbc = ls?.getItem('_fbc_fallback') || null;
  const fbp = ls?.getItem('_fbp_fallback') || null;
  const fbclid = ls?.getItem('_fbclid') || params?.get('fbclid') || null;
  const landing_site = ls?.getItem('_landing_site') || null;
  const referrer = ls?.getItem('_referrer') || null;

  return {
    fbp,
    fbc,
    fbclid,
    landing_site,
    referrer,
    utm_source: ls?.getItem('_utm_source') || params?.get('utm_source') || null,
    utm_medium: ls?.getItem('_utm_medium') || params?.get('utm_medium') || null,
    utm_campaign: ls?.getItem('_utm_campaign') || params?.get('utm_campaign') || null,
    utm_content: ls?.getItem('_utm_content') || params?.get('utm_content') || null,
    utm_term: ls?.getItem('_utm_term') || params?.get('utm_term') || null,
    utm_id: ls?.getItem('_utm_id') || params?.get('utm_id') || null,
  };
}
```

#### Step 2 — Persist raw fbclid + UTMs in `src/contexts/PixelContext.tsx`
In the `useEffect(() => {...}, [])` block, AFTER checking for fbclid, add:

```ts
// Persist raw fbclid
if (fbclid) localStorage.setItem('_fbclid', fbclid);

// Persist UTMs (first-touch only — don't overwrite if already set)
const p = new URLSearchParams(window.location.search);
['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id'].forEach(k => {
  const v = p.get(k);
  if (v && !localStorage.getItem(`_${k}`)) localStorage.setItem(`_${k}`, v);
});

// Persist landing_site (first-touch)
if (!localStorage.getItem('_landing_site')) {
  localStorage.setItem('_landing_site', window.location.href);
}

// Persist referrer (first-touch)
if (!localStorage.getItem('_referrer') && document.referrer) {
  localStorage.setItem('_referrer', document.referrer);
}
```

#### Step 3 — Add attribution to `checkout-create` via `src/lib/checkout.ts`
Modify `createCheckoutFromCart` to accept an optional `attribution` param and include it:

```ts
export const createCheckoutFromCart = async (
  cartItems: CartItem[],
  customerInfo?: { ... },
  discountCode?: string,
  shippingAddress?: any,
  billingAddress?: any,
  notes?: string,
  currencyCode: string = 'USD',
  attribution?: Record<string, string | null>   // ← ADD THIS
): Promise<CheckoutResponse> => {
  ...
  const payload: CheckoutPayload = {
    store_id: STORE_ID,
    items,
    ...
    currency_code: currencyCode,
    ...(attribution && { attribution })           // ← ADD THIS
  }
  ...
```

Then in `HeadlessCheckout.tsx` (or wherever `createCheckoutFromCart` is called), import and pass `getAttributionPayload()`.

#### Step 4 — Add attribution to `PaypalExpressButton.tsx`
In `createOrder` and `onApprove`, read attribution and include in edge calls:

```ts
import { getAttributionPayload } from '@/lib/tracking-utils'

// Inside createOrder:
const attribution = getAttributionPayload();
const result = await callEdge('paypal-create-order', {
  store_id: STORE_ID,
  checkout_token: checkoutToken,
  amount,
  currency: currencyUpper,
  items,
  shipping: shippingCost,
  attribution,          // ← ADD
})

// Inside onApprove:
const attribution = getAttributionPayload();
const res = await callEdge('paypal-capture-order', {
  store_id: STORE_ID,
  paypal_order_id: data.orderID,
  checkout_token: checkoutToken,
  attribution,          // ← ADD
})
```

#### Step 5 — (Nice to have) Add fbc/fbp to PostHog identify
In `PixelContext.tsx`, after setting fbc/fbp state, also identify the user in PostHog:
```ts
if (posthog.__loaded && (fbcValue || fbpVal)) {
  posthog.setPersonProperties({ fbc: fbcValue, fbp: fbpVal });
}
```

---

### Files to modify (in order):
1. `src/lib/tracking-utils.ts` — add `getAttributionPayload()` export
2. `src/contexts/PixelContext.tsx` — persist raw fbclid + UTMs + landing_site + referrer
3. `src/lib/checkout.ts` — add `attribution?` param + include in payload
4. `src/components/headless/HeadlessCheckout.tsx` — pass `getAttributionPayload()` to createCheckoutFromCart
5. `src/components/PaypalExpressButton.tsx` — pass attribution to both edge calls

---

## 4. Recent Changes
- 2026-06-15: **Attribution bug diagnosed** — checkout.ts and PaypalExpressButton send ZERO attribution; getAttributionPayload() doesn't exist; raw fbclid/UTMs not in localStorage
- 2026-06-10: **PaypalExpressButton.tsx** — Fixed ThankYou "Order Not Found": added `fallbackOrder` built from props; localStorage now always written via `res.order ?? fallbackOrder`
- 2026-06-10: **ThankYou page** — "Order Not Found" bug identified: res.order is null from paypal-capture-order, localStorage never written
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

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `render/image/public/message-images/0f3c776b.../1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `render/image/public/message-images/0f3c776b.../1775768374485-uca4dkx21g.webp?width=1200&quality=75`
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/ repo)

## 6. Known Issues
- **🔴 ATTRIBUTION BUG**: checkout.ts + PaypalExpressButton send NO fbclid/fbc/fbp/UTMs — fix is planned above
- **META DIAGNÓSTICO 🔴1**: Likely an expired CAPI Access Token — fix in Meta Business Manager
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label misleading
- Product slug still in Spanish — may want English slug redirect
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard > Settings > Payment methods

## 7. Key Files
- `src/contexts/SettingsContext.tsx` — ✅ Exposes paypalEnabled/paypalClientId/paypalEnvironment via RPC
- `src/components/PaypalExpressButton.tsx` — ✅ fallbackOrder fix applied | ❌ NO attribution
- `src/pages/ui/CheckoutUI.tsx` — ✅ Single PayPal instance above StripePayment
- `src/pages/ui/IndexUI.tsx` — ✅ Prices dynamically linked to product DB
- `src/contexts/PixelContext.tsx` — ✅ builds _fbc from fbclid | ❌ raw fbclid/UTMs not saved
- `src/lib/tracking-utils.ts` — ✅ CAPI reads localStorage for fbc/fbp | ❌ no getAttributionPayload()
- `src/lib/checkout.ts` — ❌ NO attribution in createCheckoutFromCart
- `src/components/StripePayment.tsx` — ✅ Full EN + trust signals + pre-pay rating
- `src/pages/ThankYou.tsx` — ✅ Reads from localStorage (no change needed)
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + Launch Offer + Shipping accordion

## 8. Pending / Future Sessions
- **🔴 HIGH**: Fix attribution (fbclid/fbc/fbp/UTMs) in checkout and PayPal — see Active Plan above
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay