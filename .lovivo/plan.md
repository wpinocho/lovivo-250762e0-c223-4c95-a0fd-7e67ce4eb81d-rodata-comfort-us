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
### ✅ DONE: PayPal Integration in Checkout

**What was built:**
- `@paypal/react-paypal-js` installed
- `SettingsContext` extended with `paypal_accounts_safe` → now uses `rpc('get_public_paypal_account')`. Exposes: `paypalEnabled`, `paypalClientId`, `paypalEnvironment`
- `src/components/PaypalExpressButton.tsx` — migrated to **SDK v6 API** (`PayPalProvider` + `PayPalOneTimePaymentButton` from `@paypal/react-paypal-js/sdk-v6`). Maps `paypalEnvironment === 'live'` → `environment="production"`.
- `CheckoutUI.tsx` — mounts `<PaypalExpressButton>` after `</StripePayment>` inside the `isStripeReady` IIFE block, wrapped in a fragment

**To activate**: Connect a PayPal account in Lovivo Dashboard → the button auto-appears.

## 4. Recent Changes
- 2026-06-10: **PaypalExpressButton.tsx** — Migrated to SDK v6 API (PayPalProvider + PayPalOneTimePaymentButton), map 'live'→'production'
- 2026-06-10: **PayPal integration** — SettingsContext (RPC query), PaypalExpressButton.tsx (new), CheckoutUI.tsx (mounted after StripePayment)
- 2026-06-10: **CheckoutUI.tsx** — Shipping shows "FREE" (was "Pending") when shippingCost === 0 on mobile
- 2026-06-09: **CheckoutUI.tsx + ProductPageUI.tsx** — Delivery window changed to 6–8 business days (was 7–9)
- 2026-06-09: **StripePayment.tsx** — Removed duplicate "30-Day Comfort Guarantee" line above buy button
- 2026-06-09: **CheckoutUI.tsx** — Added `getEstimatedDelivery()` fn + "Free shipping · Arrives [date]" line
- 2026-06-09: **CheckoutUI.tsx** — Mobile order summary now open by default
- 2026-06-09: **StripePayment.tsx** — Added pre-pay trust block ABOVE "Complete Purchase" button
- 2026-06-09: **ProductPageUI.tsx** — Added `getEstimatedDelivery()` fn + "Shipping & Returns" accordion
- 2026-06-09: **ProductPageUI.tsx** — Added Launch Offer amber badge below price block
- 2026-06-05: **StripePayment.tsx** — Added trust signals below CTA
- 2026-06-05: **CheckoutUI.tsx** — Updated top security bar
- 2026-06-05: **StripePayment.tsx + CheckoutUI.tsx** — Full English translation
- 2026-06-05: **IndexUI.tsx** — Prices dynamically read from product DB
- 2026-06-04: **PixelContext.tsx** — Persist fbclid → fbc to localStorage

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
- `src/contexts/SettingsContext.tsx` — ✅ Now exposes paypalEnabled/paypalClientId/paypalEnvironment via RPC
- `src/components/PaypalExpressButton.tsx` — ✅ SDK v6 API (PayPalProvider + PayPalOneTimePaymentButton)
- `src/pages/ui/CheckoutUI.tsx` — ✅ PaypalExpressButton mounted after StripePayment
- `src/pages/ui/IndexUI.tsx` — ✅ Prices dynamically linked to product DB
- `src/contexts/PixelContext.tsx` — ✅ fbclid persisted to localStorage + first-party cookie
- `src/lib/tracking-utils.ts` — ✅ CAPI reads localStorage fallback for fbc/fbp
- `src/components/StripePayment.tsx` — ✅ Full EN + trust signals + pre-pay rating
- `src/pages/ThankYou.tsx` — ✅ Deferred Purchase event for 3DS redirect flow
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + Launch Offer + Shipping accordion

## 8. Pending / Future Sessions
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay